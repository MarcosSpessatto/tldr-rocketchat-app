import {
	IAppAccessors,
	IConfigurationExtend,
	IConfigurationModify,
	IEnvironmentRead,
	IHttp,
	ILogger,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting } from '@rocket.chat/apps-engine/definition/settings';
import { Commands } from './src/commands/commands';
import { CronJobSetup } from './src/config/cron-job-setup';
import { AppSetting, settings } from './src/config/settings';
import { SummarizationEndpoint } from './src/endpoints/summarization';
import { SettingsHelper } from './src/helpers/settings.helper';

export class TldrApp extends App implements IPostMessageSent {
	private cronJobSetup: CronJobSetup;

	constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
		super(info, logger, accessors);
	}

	public async executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {
		if (message.sender.id !== 'rocket.cat') {
			const baseUrl = (await read.getEnvironmentReader().getSettings().getById(AppSetting.summarizationServiceUrl)).value;
			await http.post(`${baseUrl}/save-message`, { data: { text: message.text, createdAt: message.createdAt, updatedAt: message.updatedAt } });
		}
	}

	public async onSettingUpdated(setting: ISetting, configurationModify: IConfigurationModify, read: IRead, http: IHttp): Promise<void> {
		try {
			if (setting.id !== AppSetting.cronJobServiceUrl && setting.id !== AppSetting.cronJobServiceFrequency) {
				return;
			}
			const cronJobUrl = (await read.getEnvironmentReader().getSettings().getById(AppSetting.cronJobServiceUrl)).value;
			const cronJobFrequency = (await read.getEnvironmentReader().getSettings().getById(AppSetting.cronJobServiceFrequency)).value;
			if (!cronJobUrl || !cronJobFrequency) {
				return;
			}
			this.cronJobSetup = new CronJobSetup(this.getAccessors().http, new SettingsHelper(read));
			const endpoint = this.getAccessors().providedApiEndpoints && this.getAccessors().providedApiEndpoints.length && this.getAccessors().providedApiEndpoints[0].computedPath;
			if (endpoint) {
				const siteUrl = (await this.getAccessors().environmentReader.getServerSettings().getOneById('Site_Url')).value;
				this.cronJobSetup.setup(`${siteUrl}${endpoint}`, cronJobFrequency);
			}
		} catch (error) {
			this.getLogger().error(error);
		}

	}

	protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
		try {
			await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));
			await configuration.api.provideApi({
				visibility: ApiVisibility.PRIVATE,
				security: ApiSecurity.UNSECURE,
				endpoints: [
					new SummarizationEndpoint(this),
				],
			});
			await configuration.slashCommands.provideSlashCommand(new Commands());
		} catch (error) {
			this.getLogger().error(error);
		}
	}
}

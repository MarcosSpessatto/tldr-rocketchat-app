import {
	IAppAccessors,
	IConfigurationExtend,
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
import { Commands } from './src/commands/commands';
import { AppSetting, settings } from './src/config/settings';

export class TldrApp extends App implements IPostMessageSent {
	constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
		super(info, logger, accessors);
	}

	public async executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {
		const baseUrl = (await read.getEnvironmentReader().getSettings().getById(AppSetting.summarizationServiceUrl)).value;
		await http.post(`${baseUrl}/save-message`, { data: { text: message.text, createdAt: message.createdAt, updatedAt: message.updatedAt } });
	}

	protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
		try {
			await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));
			await configuration.api.provideApi({
				visibility: ApiVisibility.PRIVATE,
				security: ApiSecurity.UNSECURE,
				endpoints: [
					new MicroLearningEndpoint(this),
				],
			});
			await configuration.slashCommands.provideSlashCommand(new Commands());
		} catch (error) {
			this.getLogger().error(error);
		}
	}
}

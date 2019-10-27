import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { SummaryHandler } from '../handlers/summary.handler';
import { MessageHelper } from '../helpers/message.helper';
import { RoomHelper } from '../helpers/room.helper';
import { SettingsHelper } from '../helpers/settings.helper';
import { StorageHelper } from '../helpers/storage.helper';
import { NluSdk } from '../nlu-sdk/nlu-sdk';
import { AppSetting } from './../config/settings';
import { UserHelper } from './../helpers/user.helper';
import { AddRoomCommand } from './add-room';
import { HelpCommand } from './help';

export class Commands implements ISlashCommand {
	public command = 'tldr';
	public i18nParamsExample = 'tldr_params';
	public i18nDescription = 'tldr_description';
	public providesPreview = false;

	public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {
		const messageHelper = new MessageHelper(modify);
		const userHelper = new UserHelper(read);
		const settingsHelper = new SettingsHelper(read);
		const userToSendMessageAsBot = await userHelper.getUserByUsername('rocket.cat');
		const sender = context.getSender();
		const room = context.getRoom();
		if (!(await settingsHelper.getAppSettingById(AppSetting.summarizationServiceUrl)).value) {
			return await messageHelper.notifyUser(room, userToSendMessageAsBot, sender, 'Por favor verifique as configurações do TLDR, pois alguma coisa está faltando. =)');
		}
		// tslint:disable-next-line: max-line-length
		const userIsAllowed = sender.roles.includes('admin') || sender.roles.includes('teacher') || (sender.roles.includes('tutor') && (await settingsHelper.getAppSettingById(AppSetting.sendSummariesToTutor)).value === true);
		if (!userIsAllowed) {
			return await messageHelper.notifyUser(room, userToSendMessageAsBot, sender, 'Você não pode executar este comando.');
		}
		const helpCommand = new HelpCommand(messageHelper, userHelper);
		const nluServiceUrl = (await read.getEnvironmentReader().getSettings().getById(AppSetting.summarizationServiceUrl)).value;
		const summaryCommand = new SummaryHandler(
			new UserHelper(read),
			new RoomHelper(read, modify),
			new MessageHelper(modify),
			new StorageHelper(persistence, read.getPersistenceReader()),
			settingsHelper,
			new NluSdk(http, nluServiceUrl),
		);
		const addRoomCommand = new AddRoomCommand(
			new StorageHelper(persistence, read.getPersistenceReader()),
			new MessageHelper(modify),
			new UserHelper(read),
			new RoomHelper(read, modify),
		);
		const [command] = context.getArguments();
		if (!command) {
			return await helpCommand.run(context);
		}
		const commands = {
			'adicionar-sala': () => addRoomCommand.run(context),
			'resumir': () => summaryCommand.run(context),
			'ajuda': () => helpCommand.run(context),
		};
		return await commands[command]();
	}

}

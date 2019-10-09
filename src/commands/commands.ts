import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { MessageHelper } from '../helpers/message.helper';
import { RoomHelper } from '../helpers/room.helper';
import { SettingsHelper } from '../helpers/settings.helper';
import { StorageHelper } from '../helpers/storage.helper';
import { AppSetting } from './../config/settings';
import { UserHelper } from './../helpers/user.helper';
import { HelpCommand } from './help';
import { SendContentCommand } from './send-content';

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
		const userIsAllowed = sender.roles.includes('teacher') || (sender.roles.includes('tutor') && (await settingsHelper.getAppSettingById(AppSetting.sendSummariesToTutor)).value === true);
		if (!userIsAllowed) {
			return await messageHelper.notifyUser(room, userToSendMessageAsBot, sender, 'Você não pode executar este comando.');
		}
		// const helpCommand = new HelpCommand(messageHelper, userHelper);
		// const listStudentCommand = new NotifyTeachersHandler(
		// 	new UserHelper(read),
		// 	new RoomHelper(read, modify),
		// 	new MessageHelper(modify),
		// 	new StorageHelper(persistence, read.getPersistenceReader()),
		// 	new Analytics(http, settingsHelper),
		// 	settingsHelper,
		// );
		// const sendContentCommand = new SendContentCommand(
		// 	messageHelper,
		// 	userHelper,
		// 	new StorageHelper(persistence, read.getPersistenceReader()),
		// 	new RoomHelper(read, modify));
		// const [command] = context.getArguments();
		// if (!command) {
		// 	return await helpCommand.run(context);
		// }
		// const commands = {
		// 	'enviar-conteudo': () => sendContentCommand.run(context),
		// 	'listar-alunos': () => listStudentCommand.run(context),
		// 	'ajuda': () => helpCommand.run(context),
		// };
		// return await commands[command]();
	}

}

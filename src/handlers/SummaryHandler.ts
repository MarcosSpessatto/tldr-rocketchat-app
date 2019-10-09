import { IMessageAction, MessageActionButtonsAlignment, MessageActionType } from '@rocket.chat/apps-engine/definition/messages';
import { RocketChatAssociationModel } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { MessageHelper } from '../helpers/message.helper';
import { RoomHelper } from '../helpers/room.helper';
import { SettingsHelper } from '../helpers/settings.helper';
import { StorageHelper } from '../helpers/storage.helper';
import { UserHelper } from '../helpers/user.helper';
import { AppSetting } from './../config/settings';

export class SummaryHandler {
	private userHelper: UserHelper;
	private roomHelper: RoomHelper;
	private messageHelper: MessageHelper;
	private storageHelper: StorageHelper;
	private settingsHelper: SettingsHelper;

	constructor(userHelper: UserHelper, roomHelper: RoomHelper, messageHelper: MessageHelper, storageHelper: StorageHelper, settingsHelper: SettingsHelper) {
		this.userHelper = userHelper;
		this.roomHelper = roomHelper;
		this.messageHelper = messageHelper;
		this.storageHelper = storageHelper;
		this.settingsHelper = settingsHelper;
	}

	public async run(context?: SlashCommandContext): Promise<void> {
		const sendSummariesToTutor = (await this.settingsHelper.getAppSettingById(AppSetting.sendSummariesToTutor)).value;
		const usersToSend = (await this.roomHelper.getRoomMembersByRoomName('scratch')).filter((member) => this.needToSendSummary(member, sendSummariesToTutor));
		
		for (const user of usersToSend) {

		}
	}

	private needToSendSummary(user: IUser, sendToTutor: boolean): boolean {
		if (user.roles.includes('tutor')) {
			return sendToTutor;
		}
		return user.username !== 'admin' && user.username !== 'rocket.cat' && user.roles.includes('teacher');
	}
}

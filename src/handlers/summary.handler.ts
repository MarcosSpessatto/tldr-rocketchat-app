import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { AppSetting } from '../config/settings';
import { MessageHelper } from '../helpers/message.helper';
import { RoomHelper } from '../helpers/room.helper';
import { SettingsHelper } from '../helpers/settings.helper';
import { StorageHelper } from '../helpers/storage.helper';
import { UserHelper } from '../helpers/user.helper';
import { NluSdk } from '../nlu-sdk/nlu-sdk';

export class SummaryHandler {
	private userHelper: UserHelper;
	private roomHelper: RoomHelper;
	private messageHelper: MessageHelper;
	private storageHelper: StorageHelper;
	private settingsHelper: SettingsHelper;
	private nluSdk: NluSdk;

	constructor(userHelper: UserHelper, roomHelper: RoomHelper, messageHelper: MessageHelper, storageHelper: StorageHelper, settingsHelper: SettingsHelper, nluSdk: NluSdk) {
		this.userHelper = userHelper;
		this.roomHelper = roomHelper;
		this.messageHelper = messageHelper;
		this.storageHelper = storageHelper;
		this.settingsHelper = settingsHelper;
		this.nluSdk = nluSdk;
	}

	public async run(context?: SlashCommandContext): Promise<any> {
		const roomsToSendSummary = context ? [context.getRoom()] : await this.getRoomsToSend();
		const rooms = await this.storageHelper.getItem('tldr-rooms');
		const sender = await this.userHelper.getUserByUsername('rocket.cat');
		const tldrRoom = rooms && rooms[0] && Array.isArray(rooms[0].rooms) && roomsToSendSummary.every((room) => rooms[0].rooms.includes(room.id));
		if (!tldrRoom && context) {
			return await this.messageHelper.notifyUser(context.getRoom(), sender, context.getSender(), 'Você não pode executar este comando.');
		}
		const { frequency } = JSON.parse((await this.settingsHelper.getAppSettingById(AppSetting.cronJobServiceFrequency)).value);
		const usersToSend = context
			? [context.getSender()]
			: await this.getUsersToSendSummary();
		for (const room of roomsToSendSummary) {
			const { sentences } = await this.nluSdk.getSummary(frequency, room.id);
			for (const user of usersToSend) {
				const dm = await this.roomHelper.getRoomById((await this.roomHelper.createDMRoom(sender, user)));
				if (!sentences.length) {
					if (!context) {
						return;
					}
					return await this.messageHelper.notifyUser(room, sender, context.getSender(), `:newspaper2: \`Parece que não foram enviadas mensagens no grupo ${room.displayName} no período =(\`:newspaper2:`);
				}
				await this.messageHelper.sendMessage(dm, sender, `:newspaper2: \`Aqui está o resumo do que aconteceu no grupo ${room.displayName}\`:newspaper2:`);
				for (const sentence of sentences) {
					await this.messageHelper.sendMessage(dm, sender, sentence);
				}
			}
		}
	}

	private async getUsersToSendSummary(): Promise<Array<IUser>> {
		const sendSummariesToTutor = (await this.settingsHelper.getAppSettingById(AppSetting.sendSummariesToTutor)).value;
		const rooms = await this.storageHelper.getItem('tldr-rooms');
		let users: Array<IUser> = [];
		if (rooms && rooms[0] && Array.isArray(rooms[0].rooms)) {
			for (const roomId of rooms[0].rooms) {
				const members = (await this.roomHelper.getRoomMembersByRoomId(roomId)).filter((member) => this.needToSendSummary(member, sendSummariesToTutor));
				users = users.concat(members.filter((member) => !users.map((user) => user.id).includes(member.id)));
			}
			return users;
		}
		return users;
	}

	private async getRoomsToSend(): Promise<Array<IRoom>> {
		const rooms = await this.storageHelper.getItem('tldr-rooms');
		const roomsToSend: Array<IRoom> = [];
		for (const roomId of rooms[0].rooms) {
			roomsToSend.push(await this.roomHelper.getRoomById(roomId));
		}
		return roomsToSend;
	}

	private needToSendSummary(user: IUser, sendToTutor: boolean): boolean {
		if (user.roles.includes('tutor')) {
			return sendToTutor;
		}
		return user.username !== 'rocket.cat' && user.roles.includes('teacher');
	}
}

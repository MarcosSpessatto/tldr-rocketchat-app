import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UserHelper } from '../helpers/user.helper';
import { MessageHelper } from './../helpers/message.helper';

export class HelpCommand {
	private messageHelper: MessageHelper;
	private userHelper: UserHelper;

	constructor(messageHelper: MessageHelper, userHelper: UserHelper) {
		this.messageHelper = messageHelper;
		this.userHelper = userHelper;
	}

	public async run(context: SlashCommandContext): Promise<void> {
		const sender = await this.userHelper.getUserByUsername('rocket.cat');
		await this.messageHelper.sendMessage(context.getRoom(), sender, `*Esses são os comandos que eu entendo:*
		\`/tldr ajuda\` (Mostra essa mensagem de ajuda)
		\`/tldr adicionar-sala\` (Adicionao TLDR a sala)
		\`/tldr resumir\` (Envia o resumo ao usuário que executou o comando)`);
	}
}

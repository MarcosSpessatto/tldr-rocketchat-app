import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { TldrApp } from '../../TldrApp';
import { AppSetting } from '../config/settings';
import { SummaryHandler } from '../handlers/summary.handler';
import { MessageHelper } from '../helpers/message.helper';
import { RoomHelper } from '../helpers/room.helper';
import { SettingsHelper } from '../helpers/settings.helper';
import { StorageHelper } from '../helpers/storage.helper';
import { UserHelper } from '../helpers/user.helper';
import { NluSdk } from '../nlu-sdk/nlu-sdk';

export class SummarizationEndpoint extends ApiEndpoint {
	public path: string = 'summarization';

	constructor(public app: TldrApp) {
		super(app);
	}

	// tslint:disable-next-line:max-line-length
	public async get(request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<IApiResponse> {
		try {
			const nluServiceUrl = (await read.getEnvironmentReader().getSettings().getById(AppSetting.summarizationServiceUrl)).value;
			if (nluServiceUrl) {
				await new SummaryHandler(
					new UserHelper(read),
					new RoomHelper(read, modify),
					new MessageHelper(modify),
					new StorageHelper(persistence, read.getPersistenceReader()),
					new SettingsHelper(read),
					new NluSdk(http, nluServiceUrl),
				).run();
			}
		} catch (error) {
			console.log(error);
		}
		return this.success();
	}
}

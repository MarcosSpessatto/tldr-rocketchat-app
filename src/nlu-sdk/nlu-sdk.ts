import { IHttp } from '@rocket.chat/apps-engine/definition/accessors';

export class NluSdk {
	private http: IHttp;
	private url: string;

	constructor(http: IHttp, url: string) {
		this.http = http;
		this.url = url;
	}

	public async getSummary(frequency: string): Promise<any> {
		const result = await this.http.get(`${this.url}/summary?frequency=${frequency}`);
		if (!result) {
			return;
		}
		return result.data;
	}
}

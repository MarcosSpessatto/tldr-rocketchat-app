import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';

export enum AppSetting {
	summarizationServiceUrl = 'summarization-service_url',
	sendSummariesToTutor = 'send_summaries_to_tutor',
	cronJobServiceUrl = 'cron_job_service_url',
	cronJobServiceFrequency = 'cron_job_service_frequency',
}

export const settings: Array<ISetting> = [
	{
		id: AppSetting.sendSummariesToTutor,
		type: SettingType.BOOLEAN,
		packageValue: false,
		value: false,
		required: true,
		public: true,
		i18nLabel: 'send_summaries_to_tutor_label',
		i18nDescription: 'send_summaries_to_tutor_description',
	},
	{
		id: AppSetting.summarizationServiceUrl,
		type: SettingType.STRING,
		packageValue: '',
		value: '',
		required: true,
		public: true,
		i18nLabel: 'summarization_service_url_label',
		i18nDescription: 'summarization_service_url_description',
	},
	{
		id: AppSetting.cronJobServiceUrl,
		type: SettingType.STRING,
		packageValue: '',
		value: '',
		required: true,
		public: true,
		i18nLabel: 'cron_job_service_url_label',
		i18nDescription: 'cron_job_service_url_description',
	},
	{
		id: AppSetting.cronJobServiceFrequency,
		type: SettingType.SELECT,
		packageValue: '{"hour": "*", "minute": "*/1", "day": "*", "day_of_week": "*"}',
		value: '{"hour": "*", "minute": "*/1", "day": "*", "day_of_week": "*"}',
		values: [{
			key: '{"hour": "12", "minute": "0", "day": "*", "day_of_week": "*"}',
			i18nLabel: 'every_day_12_hours_label',
		}, {
			key: '{"hour": "12", "minute": "0", "day": "*", "day_of_week": "3"}',
			i18nLabel: 'every_wednesday_12_label',
		},
		{
			key: '{"hour": "*", "minute": "*/1", "day": "*", "day_of_week": "*"}',
			i18nLabel: 'every_minute_label',
		},
		{
			key: '{"hour": "*/12", "minute": "0", "day": "*", "day_of_week": "*"}',
			i18nLabel: 'every_12_hours_label',
		}],
		required: true,
		public: true,
		i18nLabel: 'cron_job_service_url_label',
		i18nDescription: 'cron_job_service_url_description',
	},
];

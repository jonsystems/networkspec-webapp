export enum HostNetwork {
	ee = "ee",
	vodafone = "vodafone",
	o2 = "o2",
	three = "three"
}

export type NetworkDetail = {
	title: string;
	text: string;
};

export type NetworkFlag = {
	enabled: boolean;
	text: string;
};

export type MobileNetwork = {
	name: string;
	is_mvno: boolean;
	flags: {
		band_access_speed_restrictions: NetworkDetail,
		nr: NetworkFlag,
		volte: NetworkFlag,
		wifi_calling_sms: NetworkFlag,
		esim: NetworkFlag,
		three_way_call: NetworkFlag,
		visual_voicemail: NetworkFlag,
		hd_voice: NetworkFlag,
		evs_voice: NetworkFlag,
		carrier_provided_ims: NetworkFlag,
		carrier_provided_voicemail: NetworkFlag,
		inclusive_mms: NetworkFlag,
		unlimited_data: NetworkFlag,
		inclusive_eu_roaming: NetworkFlag,
		nr_roaming: NetworkFlag,
		volte_roaming: NetworkFlag
	}
};

export const featureFlagTitles = {
	nr: "5G",
	volte: "VoLTE",
	wifi_calling_sms: "WiFi Calling & SMS",
	esim: "eSIM",
	three_way_call: "3 Way Calling",
	visual_voicemail: "Visual Voicemail",
	hd_voice: "HD Voice",
	evs_voice: "HD+ (EVS) Voice",
	carrier_provided_ims: "Host Provided IMS",
	carrier_provided_voicemail: "Host Provided Voicemail",
	inclusive_mms: "Inclusive MMS",
	unlimited_data: "Ultd Data",
	inclusive_eu_roaming: "Inclusive EU Roaming",
	nr_roaming: "5G Roaming",
	volte_roaming: "VoLTE Roaming"
};
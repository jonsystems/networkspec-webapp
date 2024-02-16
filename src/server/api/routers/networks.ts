import { z } from "zod";
import fetch from "node-fetch";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { HostNetwork, MobileNetwork, featureFlagTitles } from "@/lib/types";

const valueEnabled = (values: any, value: number) => {
	return values[value] && (typeof values[value] === "string" && (values[value].includes("✅") || !values[value].includes("❌")))
};

const titleDetailCombined = (title: string, detail: string) => {
	if (!detail || typeof detail !== "string") return title;
	detail = detail.replaceAll(/✅|❌/g, "");
	if(detail.length < 2) return title;
	return `${title} ${detail.includes("+") ? "" : "-"} ${detail}`;
};

export const networksRouter = createTRPCRouter({
	getNetworks: publicProcedure
		.query(async ({ ctx }) => {
			const data = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/126in1zdWmjTkPB1dU2OvWF7BzTpNWiJLPGWgZ3C0n-Q/values/Sheet1?alt=json&key=${env.GOOGLE_SHEETS_API_KEY}`).then(r => r.json()) as any;
			const values = data.values;

			type HostNetworks = { [key in HostNetwork]: MobileNetwork[] };
			const hostNetworks = {
				ee: [],
				vodafone: [],
				o2: [],
				three: []
			} as HostNetworks;

			let currentHost = "ee" as HostNetwork;

			const addVirtualNetwork = (values: any, host: HostNetwork) => {
				hostNetworks[host].push({
					name: values[1],
					is_mvno: true,
					flags: {
						band_access_speed_restrictions: {
							title: "Network Access/Speed Restrictions",
							text: values[2]
						},
						nr: {
							enabled: valueEnabled(values, 3),
							text: titleDetailCombined(featureFlagTitles.nr, values[3])
						},
						volte: {
							enabled: valueEnabled(values, 4),
							text: titleDetailCombined(featureFlagTitles.volte, values[4])
						},
						wifi_calling_sms: {
							enabled: valueEnabled(values, 5),
							text: titleDetailCombined(featureFlagTitles.wifi_calling_sms, values[5])
						},
						esim: {
							enabled: valueEnabled(values, 6),
							text: titleDetailCombined(featureFlagTitles.esim, values[6])
						},
						three_way_call: {
							enabled: valueEnabled(values, 7),
							text: titleDetailCombined(featureFlagTitles.three_way_call, values[7])
						},
						visual_voicemail: {
							enabled: valueEnabled(values, 8),
							text: titleDetailCombined(featureFlagTitles.visual_voicemail, values[8])
						},
						hd_voice: {
							enabled: valueEnabled(values, 9),
							text: titleDetailCombined(featureFlagTitles.hd_voice, values[9])
						},
						evs_voice: {
							enabled: valueEnabled(values, 10),
							text: titleDetailCombined(featureFlagTitles.evs_voice, values[10])
						},
						carrier_provided_ims: {
							enabled: valueEnabled(values, 11),
							text: titleDetailCombined(featureFlagTitles.carrier_provided_ims, values[11])
						},
						carrier_provided_voicemail: {
							enabled: valueEnabled(values, 12),
							text: titleDetailCombined(featureFlagTitles.carrier_provided_voicemail, values[12])
						},
						inclusive_mms: {
							enabled: valueEnabled(values, 13),
							text: titleDetailCombined(featureFlagTitles.inclusive_mms, values[13])
						},
						unlimited_data: {
							enabled: valueEnabled(values, 14),
							text: titleDetailCombined(featureFlagTitles.unlimited_data, values[14])
						},
						inclusive_eu_roaming: {
							enabled: valueEnabled(values, 15),
							text: titleDetailCombined(featureFlagTitles.inclusive_eu_roaming, `${values[15]} ${values[16]}`)
						},
						nr_roaming: {
							enabled: valueEnabled(values, 17),
							text: titleDetailCombined(featureFlagTitles.nr_roaming, values[17])
						},
						volte_roaming: {
							enabled: valueEnabled(values, 18),
							text: titleDetailCombined(featureFlagTitles.volte_roaming, values[18])
						}
					}
				})
			};

			let concurrentBlanks = 0;
			for (let i = 0; i < values.length; i++) {
				let rowData = values[i];
				if (i === 0) continue; //ignore the first row
				if (concurrentBlanks === 3) continue; //we've hit the end of the MVNO's list
				if (rowData.length === 0) {
					concurrentBlanks++;
					continue;
				}
				if (![19, 18, 17].includes(rowData.length)) {
					continue;
				}

				if (concurrentBlanks > 0) {
					concurrentBlanks = 0;
					if (currentHost === "ee") currentHost = "vodafone" as HostNetwork;
					else if (currentHost === "vodafone") currentHost = "o2" as HostNetwork;
					else if (currentHost === "o2") currentHost = "three" as HostNetwork;
					else if (currentHost === "three") continue; //we've hit the end of the MVNO's list
				}

				addVirtualNetwork(rowData, currentHost);
			};

			return {
				networks: {
					hosts: ["ee", "o2", "vodafone", "three"] as HostNetwork[],
					networks: hostNetworks
				},
				feature_flags: {
					feature_flag_titles: featureFlagTitles,
					feature_flags: Object.keys(featureFlagTitles)
				}
			};
		})
});

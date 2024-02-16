"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HostNetwork, MobileNetwork, featureFlagTitles } from "@/lib/types";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import ThemeToggle from "./_components/theme-toggle";
import { Button } from "@/components/ui/button";

const MobileNetworkCard = ({ network, filterFlags }: { network: MobileNetwork, filterFlags: string[] }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{network.name}</CardTitle>
			</CardHeader>
			<CardContent>
				{Object.keys(network.flags).filter(f => network.flags[f].enabled === true).map(f => ({ ...network.flags[f], flag: f })).map((flag, index) => (
					<Badge
						className="mx-0.5"
						variant={filterFlags.includes(flag.flag) ? "default" : "secondary"}
						key={`network-${network.name.toLowerCase().replaceAll(" ", "")}-feature-${index}`}
					>
						{flag.text}
					</Badge>
				))}
			</CardContent>
		</Card>
	)
};

export default () => {
	const networks = api.networks.getNetworks.useQuery();

	const [selectedHost, setSelectedHost] = useState<HostNetwork>("ee" as HostNetwork);
	const [visibleNetworks, setVisibleNetworks] = useState<MobileNetwork[]>([]);
	const [requiredFlags, setRequiredFlags] = useState<string[]>([]);
	const [filtersVisMob, setFiltersVisMob] = useState<boolean>(false);

	useEffect(() => {
		if (!networks.data) return;
		console.log(requiredFlags);
		if (requiredFlags.length > 0) {
			setVisibleNetworks(
				networks.data.networks.networks[selectedHost].filter(n => {
					for (const flag of requiredFlags) {
						console.log(n.flags, flag);
						if (!n.flags[flag] || !n.flags[flag].enabled) return false;
					}
					return true;
				})
			);
		} else {
			setVisibleNetworks(networks.data.networks.networks[selectedHost]);
		};
	}, [selectedHost, requiredFlags, networks.data]);

	return (
		<div className="flex flex-col min-w-screen min-h-screen justify-center items-center bg-background">
			<div className="flex flex-col items-center sm:items-start sm:flex-row w-full h-full sm:w-screen sm:h-screen 2xl:w-[1224px] 2xl:h-[800px] bg-background/[0.5] sm:rounded-md sm:border sm:border-solid border-border">
				<div className="flex flex-col items-center justify-between w-5/6 sm:w-1/4 h-full sm:border-r sm:border-solid border-border">
					<div className="flex flex-col justify-start sm:justify-center w-full">
						<Tabs className="w-full" defaultValue={selectedHost} onValueChange={(value: string) => setSelectedHost(value as HostNetwork)}>
							<div className="flex justify-start sm:justify-center sm:border-b sm:border-border py-8 sm:py-12">
								{networks.data && networks.data.networks.hosts
									? (
										<TabsList>
											{networks.data.networks.hosts.map((host, index) => (
												<TabsTrigger
													key={`networks-tabs-${host}-${index}`}
													className={host.length > 2 ? "capitalize" : "uppercase"}
													value={host}
												>
													{host}
												</TabsTrigger>
											))}
										</TabsList>
									)
									: <Skeleton className="w-full sm:w-3/4 h-[40px]" />
								}
							</div>
						</Tabs>
						{networks.data && networks.data.feature_flags
							? (
								<div className="flex justify-center w-full">
									<div
										className={`${filtersVisMob ? "flex mb-8 sm:mb-0" : "hidden sm:flex"} flex-col gap-y-1 p-12 w-full sm:w-3/4 sm:px-0 border border-border rounded-lg sm:border-none`}
									>
										{networks.data.feature_flags.feature_flags.map((feature_flag, index) => (
											<div
												key={`feature-flag-filter-${feature_flag}-${index}`}
												className="flex items-center gap-x-2"
											>
												<Checkbox
													onCheckedChange={(value: boolean) => {
														if (value === true) {
															setRequiredFlags(requiredFlags.concat(feature_flag))
														} else {
															setRequiredFlags(requiredFlags.filter(f => f !== feature_flag))
														};
													}}
												/>
												<div className="text-sm">{networks.data.feature_flags.feature_flag_titles[feature_flag]}</div>
											</div>
										))}
									</div>
								</div>
							)
							: (
								<div className="flex justify-center w-full">
									<div
										className={`${filtersVisMob ? "flex mb-8 sm:mb-0" : "hidden sm:flex"} flex-col gap-y-2 p-12 w-full sm:w-3/4 sm:px-0 border border-border rounded-lg sm:border-none`}
									>
										<Skeleton className="w-3/4 h-7" />
										<Skeleton className="w-3/4 h-7" />
										<Skeleton className="w-3/4 h-7" />
										<Skeleton className="w-3/4 h-7" />
										<Skeleton className="w-3/4 h-7" />
										<Skeleton className="w-3/4 h-7" />
										<Skeleton className="w-3/4 h-7" />
										<Skeleton className="w-3/4 h-7" />
									</div>
								</div>
							)
						}
					</div>
					<div className="flex gap-x-4 sm:py-12 w-full sm:w-3/4">
						<div className="flex sm:hidden w-3/4">
							<Button className="w-full" variant={"default"} onClick={() => setFiltersVisMob(!filtersVisMob)}>{filtersVisMob ? "Hide" : "Show"} Filters</Button>
						</div>
						<div className="flex w-1/4 sm:w-full">
							<ThemeToggle />
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-y-8 w-5/6 sm:w-3/4 py-8 sm:p-8 h-full overflow-y-auto">
					{networks.isSuccess && networks.data
						? (
							<>
								{visibleNetworks.map((network, index) => (
									<MobileNetworkCard network={network} filterFlags={requiredFlags} key={`mobile-network-${index}`} />
								))}
							</>
						)
						: (
							<>
								<Skeleton className="w-full h-[221px] sm:h-[146px]" />
								<Skeleton className="w-full h-[221px] sm:h-[146px]" />
								<Skeleton className="w-full h-[187px] sm:h-[121px]" />
								<Skeleton className="w-full h-[187px] sm:h-[121px]" />
							</>
						)
					}
				</div>
			</div>
		</div>
	)
};
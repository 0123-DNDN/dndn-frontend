export const seniorTypography = {
	caption: 18,
	body: 20,
	bodyStrong: 20,
	button: 21,
	sectionTitle: 28,
	pageTitle: 32,
	hero: 36,
	amount: 40,
	tabLabel: 17,
} as const;

export const guardianTypography = {
	caption: 14,
	secondary: 16,
	body: 17,
	bodyStrong: 17,
	button: 18,
	sectionTitle: 22,
	pageTitle: 28,
	hero: 32,
	amount: 36,
	tabLabel: 15,
} as const;

export const typography = {
	body: seniorTypography.caption,
	title: seniorTypography.sectionTitle,
	heroTitle: seniorTypography.pageTitle,
	mainNumberMin: seniorTypography.pageTitle,
	mainNumberMax: guardianTypography.amount,
} as const;

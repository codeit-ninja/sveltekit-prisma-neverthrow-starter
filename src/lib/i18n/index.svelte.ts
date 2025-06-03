import { I18n, type TranslateOptions } from 'i18n-js';
import en from '$lib/locales/en/translations.json';
import nl from '$lib/locales/nl/translations.json';

type PathsToStringProps<T> = T extends string
	? []
	: {
			[K in Extract<keyof T, string>]: T[K] extends string
				? [K]
				: T[K] extends Record<string, any>
					? [K, ...PathsToStringProps<T[K]>]
					: never;
		}[Extract<keyof T, string>];

type Join<T extends readonly string[], D extends string> = T extends readonly [infer F, ...infer R]
	? F extends string
		? string extends F
			? string
			: R extends readonly string[]
				? `${F}${R extends readonly [] ? '' : D}${Join<R, D>}`
				: never
		: never
	: '';

type DotNotation<T> = Join<PathsToStringProps<T>, '.'>;
type TranslatePaths = DotNotation<typeof en> | DotNotation<typeof nl>;

class Localization {
	#i18n: I18n;

	#locale = $state('en');

	translations = $state({
		en,
		nl
	});

	constructor() {
		this.#i18n = new I18n(this.translations, { defaultLocale: this.#locale });

		$effect.root(() => {
			$effect(() => {
				this.#i18n.locale = this.#locale;
				this.#i18n.translations = this.translations;
			});
		});
	}

	t = $derived.by(() => {
		this.#locale;
		return (key: TranslatePaths, options?: TranslateOptions): string =>
			this.#i18n.t(key, options);
	});

	get locale() {
		return this.#locale;
	}

	set locale(locale: string) {
		this.#locale = locale;
	}
}

export const localization = new Localization();
export const t = (key: TranslatePaths, options?: TranslateOptions) => localization.t(key, options);

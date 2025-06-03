<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Field, Label, FieldErrors, Control, Description, Fieldset, Legend } from 'formsnap';
	import { t } from '$lib/i18n/index.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginSchema } from './schema';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(loginSchema)
	});

	const { form: formData, enhance, message } = form;
</script>

<form method="POST" use:enhance>
	<div class="flex h-screen w-full items-center justify-center px-4">
		<Card.Root class="mx-auto w-full max-w-sm">
			<Card.Header>
				<Card.Title class="text-2xl">{t('pages.auth.login.title')}</Card.Title>
				<Card.Description>{t('pages.auth.login.description')}</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if $message}
					<div
						class="mb-4 rounded border border-red-500 bg-red-50 px-3 py-2 text-red-700"
					>
						{$message.message}
					</div>
				{/if}
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Field {form} name="email">
							<Control>
								{#snippet children({ props })}
									<Label>Email</Label>
									<Input type="email" {...props} bind:value={$formData.email} />
								{/snippet}
							</Control>
						</Field>
					</div>
					<div class="grid gap-2">
						<Field {form} name="password">
							<Control>
								{#snippet children({ props })}
									<div class="flex items-center">
										<Label>Password</Label>
										<a href="##" class="ml-auto inline-block text-sm underline">
											Forgot your password?
										</a>
									</div>
									<Input
										type="password"
										{...props}
										bind:value={$formData.password}
									/>
								{/snippet}
							</Control>
						</Field>
					</div>
					<Button type="submit" class="w-full">Login</Button>
				</div>
				<div class="mt-4 text-center text-sm">
					Don't have an account?
					<a href="##" class="underline"> Sign up </a>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</form>

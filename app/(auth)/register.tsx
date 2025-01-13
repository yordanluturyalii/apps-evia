import ArrowLeft from "@/assets/images/icons/arrow-left.svg";
import FormInput from "@/components/FormInput";
import HeaderBack from "@/components/HeaderBack";
import RequiredText from "@/components/RequiredText";
import ThemedButton from "@/components/ThemedButton";
import { AccountRequiredText } from "@/constants";
import { useApi } from "@/hooks/useApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, set, useForm, useWatch } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { object, string } from "zod";
import * as SecureStore from 'expo-secure-store';

const numberRegex = /[0-9]/;
const alphabetRegex = /[A-Z]/;

const schema = object({
	email: string().email(),
	password: string()
		.min(8)
		.regex(numberRegex, "Password must contain a number")
		.regex(alphabetRegex, "Password must contain an uppercase letter"),
	password_confirmation: string()
		.min(8)
		.regex(numberRegex, "Password must contain a number")
		.regex(alphabetRegex, "Password must contain an uppercase letter"),
}).refine((data) => data.password === data.password_confirmation, {
	message: "Passwords don't match",
	path: ["password_confirmation"],
});

type FormData = {
	email: string;
	password: string;
	password_confirmation: string;
};

type RegisterResponse = {
	id: number;
	email: string;
	token: string;
};

export default function RegisterScreen() {
	const router = useRouter();
	const { data, error, isLoading, fetchData } = useApi<RegisterResponse>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		control,
		handleSubmit,
		watch,
		formState: { isValid },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		mode: "onChange",
	});

	useEffect(() => {
		if (data) {
			SecureStore.setItemAsync("token", data.data.token);
			router.push("/");
		}
	}, [data]);

	const onSubmit = async (formData: FormData) => {
		setIsSubmitting(true);
		fetchData({
			method: "POST",
			uri: "/auth/register",
			data: formData,
		});

		if (error) {
			console.log(error);
			return;
		}
	};

	const password = watch("password");

	const isLengthValid = password?.length >= 8;
	const containsNumber = numberRegex.test(password || "");
	const containsUpperCase = alphabetRegex.test(password || "");
	const route = useRouter();

	return (
		<View>
			<HeaderBack
				handleNavigation={() => {
					route.back();
				}}
			/>
			<Text className="text-xl font-semibold mb-11">
				Create an Evia account.
			</Text>
			{error && (
				<View className="mt-11 mb-5">
					<Text className="text-xs text-center text-error-text-link bg-error-surface-default-subtle rounded-lg py-3 px-4 w-fit mx-auto border border-error-border-default">
						{error ?? "Error"}
					</Text>
				</View>
			)}
			<Controller
				control={control}
				name="email"
				render={({ field: { onChange, value } }) => (
					<FormInput
						className="mb-5"
						contentType="emailAddress"
						label="Email"
						placeholder="johndoe@gmail.com"
						onChange={onChange}
						value={value}
					/>
				)}
			/>
			<Controller
				control={control}
				name="password"
				render={({ field: { onChange, value } }) => (
					<FormInput
						className="mb-5"
						contentType="password"
						label="Password"
						placeholder="Password"
						onChange={onChange}
						value={value}
					/>
				)}
			/>
			<Controller
				control={control}
				name="password_confirmation"
				render={({ field: { onChange, value } }) => (
					<FormInput
						className="mb-5"
						contentType="password"
						label="Confirm Password"
						placeholder="Confirm Password"
						onChange={onChange}
						value={value}
					/>
				)}
			/>
			<Text className="mb-3 text-xs mt-7">Password must contain:</Text>
			<View className="mb-5">
				<RequiredText title="At least 8 characters" isValid={isLengthValid} />
				<RequiredText title="At least one number" isValid={containsNumber} />
				<RequiredText
					title="At least one uppercase letter"
					isValid={containsUpperCase}
				/>
			</View>

			<ThemedButton
				disabled={!isValid}
				isLoading={isLoading || isSubmitting}
				onPress={handleSubmit(onSubmit)}
			>
				Create an Account
			</ThemedButton>
		</View>
	);
}

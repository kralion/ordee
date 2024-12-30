import { supabase } from "@/utils/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
type TSignUp = {
  email: string;
  password: string;
  name: string;
  company: string;
  last_name: string;
};
export default function SignUpScreen() {
  const [loading, setLoading] = React.useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TSignUp>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      company: "",
      last_name: "",
    },
  });

  const onSubmit = async (data: TSignUp) => {
    setLoading(true);

    try {
      const { data: user, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,

        options: {
          data: {
            company: data.company,
          },
        },
      });

      if (signUpError || !user.user?.user_metadata) {
        console.error("SIGNUP ERROR", signUpError);
        return;
      }

      const { error: companyError } = await supabase.from("tenants").insert({
        name: data.company,
        id_admin: user?.user?.id,
      });

      if (companyError) {
        console.error("COMPANY INSERT ERROR", companyError);
        return;
      }

      // Wait for a short period to ensure the insert is processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: companyData, error: companyFetchError } = await supabase
        .from("tenants")
        .select("*")
        .eq("id_admin", user?.user?.id)
        .single();
      if (companyFetchError || !companyData) {
        console.error("COMPANY FETCH ERROR", companyFetchError);
      }

      const { error: accountError } = await supabase.from("accounts").insert({
        name: data.name,
        last_name: data.last_name,
        role: "admin",
        id_tenant: companyData.id,
        id: user?.user?.id,
      });

      if (accountError) {
        console.error("ACCOUNT ERROR", accountError);
      }

      reset();
      toast.success("Cuenta creada exitosamente!", {
        icon: <FontAwesome name="check-circle" size={20} color="green" />,
      });
    } catch (error) {
      console.error("ERROR", error);
    } finally {
      setLoading(false);
    }

    router.push("/(tabs)");
  };

  return (
    <ScrollView className="bg-white  dark:bg-zinc-900">
      <SafeAreaView className="flex flex-col justify-center align-middle m-4 items-center ">
        <View className="flex flex-col gap-10 w-full items-center">
          <View className="flex flex-col items-center gap-8 mt-10">
            <Image
              style={{
                width: 125,
                height: 125,
              }}
              source={require("../../assets/images/logo.png")}
            />
            <View className="flex flex-col gap-1 items-center">
              <Text className="text-4xl font-bold dark:text-white">
                Crea una cuenta
              </Text>
              <Text className="text-center  dark:text-white">
                Ingresa tus datos para crear una cuenta
              </Text>
            </View>
          </View>
          <View className="flex flex-col gap-3 justify-center align-middle w-full">
            <Controller
              control={control}
              name="company"
              render={({ field: { onChange, value } }) => (
                <View className="flex flex-col gap-2">
                  <TextInput
                    label="Negocio"
                    mode="outlined"
                    error={errors.company ? true : false}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors.company && (
                    <View className="flex flex-row gap-1">
                      <Text className="text-red-500">
                        {errors.company.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              rules={{
                required: {
                  value: true,
                  message: "Ingrese el nombre del negocio",
                },
              }}
            />
            <Controller
              control={control}
              name="last_name"
              render={({ field: { onChange, value } }) => (
                <View className="flex flex-col gap-2">
                  <TextInput
                    label="Apellidos"
                    mode="outlined"
                    error={errors.last_name ? true : false}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors.last_name && (
                    <View className="flex flex-row gap-1">
                      <Text className="text-red-500">
                        {errors.last_name.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              rules={{
                required: { value: true, message: "Ingrese tus apellidos" },
              }}
            />
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View className="flex flex-col gap-2">
                  <TextInput
                    label="Nombres"
                    mode="outlined"
                    error={errors.name ? true : false}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors.name && (
                    <View className="flex flex-row gap-1">
                      <Text className="text-red-500">
                        {errors.name.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              rules={{
                required: { value: true, message: "Ingrese tus nombres" },
              }}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View className="flex flex-col gap-2">
                  <TextInput
                    label="Email"
                    mode="outlined"
                    error={errors.email ? true : false}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors.email && (
                    <View className="flex flex-row gap-1">
                      <Text className="text-red-500">
                        {errors.email.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              rules={{
                required: { value: true, message: "Ingrese el email" },
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Ingrese un email válido",
                },
              }}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View className="flex flex-col gap-2">
                  <TextInput
                    label="Contraseña"
                    secureTextEntry
                    mode="outlined"
                    error={errors.password ? true : false}
                    onChangeText={onChange}
                    value={value}
                    right={<TextInput.Icon icon="lock" />}
                  />
                  {errors.password && (
                    <View className="flex flex-row gap-1">
                      <Text className="text-red-500">
                        {errors.password.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              rules={{
                required: { value: true, message: "Ingrese la contraseña" },
              }}
            />
          </View>
          <View className="flex flex-col gap-4 w-full">
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
            >
              Crear Cuenta
            </Button>
            <Text className="text-muted-foreground text-zinc-400   mx-auto">
              Ya tienes una cuenta?
              <Text className=" text-orange-500" onPress={() => router.back()}>
                {" "}
                Inicia Sesión
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

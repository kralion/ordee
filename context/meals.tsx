import { IMeal, IMealContextProvider } from "@/interfaces";
import { supabase } from "@/utils/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { endOfDay, startOfDay } from "date-fns";
import * as React from "react";
import { createContext, useContext } from "react";
import { toast } from "sonner-native";
import { useAuth } from "./auth";

export const MealContext = createContext<IMealContextProvider>({
  addMeal: async () => {},
  getMealById: async (id: string): Promise<IMeal> => ({} as IMeal),
  meals: [],
  meal: {} as IMeal,
  getMealsByCategoryId: async () => [] as IMeal[],
  loading: false,
  deleteMeal: async () => {},
  getDailyMeals: async () => [] as IMeal[],
  changeMealAvailability: async () => {},
});

export const MealContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [meals, setDailyMeals] = React.useState<IMeal[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { profile } = useAuth();
  const [meal, setMeal] = React.useState<IMeal>({} as IMeal);

  const addMeal = async (meal: IMeal) => {
    setLoading(true);
    const { error } = await supabase.from("meals").insert({
      ...meal,
      id_tenant: profile.id_tenant,
    });
    if (error) {
      console.error("Error adding meal:", error);
      toast.error("Error al agregar item!", {
        icon: <FontAwesome name="times-circle" size={20} color="red" />,
      });
      return;
    }
    toast.success("Item agregado al menú!", {
      icon: <FontAwesome name="check-circle" size={20} color="green" />,
    });
    setLoading(false);
  };

  const getDailyMeals = async () => {
    setLoading(true);
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("id_tenant", profile.id_tenant)
      .eq("stock", true)
      .eq("created_at", formattedDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching daily meals:", error);
      return null;
    }

    setDailyMeals(data);
    setLoading(false);
    return data;
  };

  const changeMealAvailability = async (id: string, quantity: number) => {
    const { error } = await supabase
      .from("meals")
      .update({ quantity })
      .eq("id", id);
    if (error) {
      console.error("Error updating meal:", error);
      toast.error("Error al actualizar item!", {
        icon: <FontAwesome name="times-circle" size={20} color="red" />,
      });
      return;
    }
    toast.success("Item actualizado!", {
      icon: <FontAwesome name="check-circle" size={20} color="green" />,
    });
  };

  const getMealsByCategoryId = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("id_category", id)
      .eq("stock", true)
      .eq("id_tenant", profile.id_tenant);
    if (error) throw error;
    setLoading(false);
    return data;
  };

  const deleteMeal = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) {
      console.error("Error deleting meal:", error);
      toast.error("Error al eliminar item!", {
        icon: <FontAwesome name="times-circle" size={20} color="red" />,
      });
      return;
    }
    toast.success("Item eliminado!", {
      icon: <FontAwesome name="check-circle" size={20} color="green" />,
    });
    setLoading(false);
  };

  async function getMealById(id: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("meals")
      .select("*, users:id_user(name)")
      .eq("id", id)
      .single();
    if (error) throw error;
    setMeal(data);
    setLoading(false);
    return data;
  }

  return (
    <MealContext.Provider
      value={{
        meals,
        deleteMeal,
        loading,
        getMealsByCategoryId,
        getMealById,
        changeMealAvailability,
        getDailyMeals,
        addMeal,
        meal,
      }}
    >
      {children}
    </MealContext.Provider>
  );
};

export const useMealContext = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error("useMealContext must be used within a MealProvider");
  }
  return context;
};

export interface IMeal {
  id: string;
  name: string;
  price: number;
  created_at?: Date;
  image_url: string;
  category: "entradas" | "fondos" | "bebidas" | "helados";
  quantity: number;
}

export interface IMealContextProvider {
  addMeal: (Meal: IMeal) => Promise<void>;
  getMealById: (id: string) => Promise<IMeal>;
  changeMealAvailability: (id: string, quantity: number) => Promise<void>;
  meals: IMeal[];
  meal: IMeal;
  deleteMeal: (id: string) => Promise<void>;
  getDailyMeals: () => Promise<null | IMeal[]>;
}

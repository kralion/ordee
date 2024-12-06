import { IMeal, IUser } from "@/interfaces";

export interface IOrder {
  id?: string;
  table: number;
  date: Date;
  users?: IUser;
  id_waiter: string;
  served: boolean;
  to_go: boolean;
  paid: boolean;
  entradas: IMeal[];
  fondos: IMeal[];
  bebidas: IMeal[];
}

export interface IOrderContextProvider {
  addOrder: (order: IOrder, tableNumber: number) => Promise<void>;
  updateOrderServedStatus: (id: string) => Promise<void>;
  getUnservedOrders: () => Promise<IOrder[]>;
  getPaidOrders: () => Promise<IOrder[]>;
  getOrderById: (id: string) => Promise<IOrder>;
  orders: IOrder[];
  order: IOrder;
  paidOrders: IOrder[];
  deleteOrder: (id: string) => Promise<void>;
  getOrders: () => Promise<IOrder[]>;
}

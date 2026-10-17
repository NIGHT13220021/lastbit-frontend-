import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initialDeals } from "../data/mockData";
import { minutesLeft } from "../utils/time";

// In-memory demo store. Later, replace these functions with calls to your Node.js API.
// Stock checks, payment verification and OTP generation MUST move to the server before launch.
const DealsContext = createContext(null);

const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const makeOrderId = () => "LB" + Math.floor(10000 + Math.random() * 90000);

export function DealsProvider({ children }) {
  const [deals, setDeals] = useState(initialDeals);
  const [savedIds, setSavedIds] = useState([]);
  const [orders, setOrders] = useState([]);
  // store = null | { name, owner, phone, address, fssai, status: "pending" | "verified" }
  const [store, setStore] = useState(null);
  // reusable dishes (name, category, veg, usual price, photo) so stores never re-upload photos
  const [menu, setMenu] = useState([]);

  const getDeal = useCallback((id) => deals.find((d) => d.id === id), [deals]);
  const getOrder = useCallback((id) => orders.find((o) => o.id === id), [orders]);
  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  const toggleSaved = useCallback((id) => {
    setSavedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);

  // Returns { ok: true, order } or { ok: false, error }
  const reserve = useCallback(
    (dealId, qty) => {
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) return { ok: false, error: "This deal is no longer available." };
      if (deal.stock < 1) return { ok: false, error: "Sorry, this deal just sold out." };
      if (deal.stock < qty) return { ok: false, error: `Only ${deal.stock} plate(s) left.` };
      // the customer must collect within the store's "collect within" minutes (never later than the deal's end)
      const holdMin = deal.holdMin ?? 30;
      const leftMin = minutesLeft(deal);
      const dealEnd = leftMin === null ? Infinity : Date.now() + leftMin * 60000;
      const collectBy = Math.min(Date.now() + holdMin * 60000, dealEnd);
      const order = {
        id: makeOrderId(),
        dealId,
        qty,
        total: deal.price * qty,
        saved: (deal.original - deal.price) * qty,
        otp: makeOtp(),
        status: "confirmed", // confirmed | collected | cancelled
        refund: null,
        createdAt: Date.now(),
        collectBy,
      };
      setDeals((cur) => cur.map((d) => (d.id === dealId ? { ...d, stock: d.stock - qty } : d)));
      setOrders((cur) => [order, ...cur]);
      return { ok: true, order };
    },
    [deals]
  );

  const cancelOrder = useCallback(
    (orderId) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order || order.status !== "confirmed") return;
      setOrders((cur) =>
        cur.map((o) =>
          o.id === orderId ? { ...o, status: "cancelled", refund: `Refund of ₹${o.total} initiated (demo)` } : o
        )
      );
      setDeals((cur) => cur.map((d) => (d.id === order.dealId ? { ...d, stock: d.stock + order.qty } : d)));
    },
    [orders]
  );

  const markCollected = useCallback((orderId) => {
    setOrders((cur) => cur.map((o) => (o.id === orderId && o.status === "confirmed" ? { ...o, status: "collected" } : o)));
  }, []);

  /* ---------- store mode ---------- */
  const addMenuItem = useCallback((item) => {
    const id = "m" + Date.now();
    setMenu((cur) => [...cur, { ...item, id }]);
    return id;
  }, []);

  const updateMenuItem = useCallback((id, patch) => {
    setMenu((cur) => cur.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const removeMenuItem = useCallback((id) => {
    setMenu((cur) => cur.filter((m) => m.id !== id));
  }, []);

  const registerStore = useCallback((info) => setStore({ ...info, status: "pending" }), []);

  // DEMO ONLY: in the real app an admin approves stores from your backend after checking the FSSAI licence.
  const approveStore = useCallback(() => setStore((cur) => (cur ? { ...cur, status: "verified" } : cur)), []);

  const addDeal = useCallback((deal) => {
    const id = "d" + Date.now();
    setDeals((cur) => [{ ...deal, id, isMine: true, distanceKm: 0.5 }, ...cur]);
    return id;
  }, []);

  const updateDeal = useCallback((id, patch) => {
    setDeals((cur) => cur.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const removeDeal = useCallback((id) => {
    setDeals((cur) => cur.filter((d) => d.id !== id));
  }, []);

  // store enters the customer's code; returns true if an order was handed over
  const verifyPickup = useCallback(
    (code) => {
      const order = orders.find(
        (o) =>
          o.status === "confirmed" &&
          String(o.otp) === String(code).trim() &&
          deals.find((d) => d.id === o.dealId)?.isMine
      );
      if (!order) return false;
      setOrders((cur) => cur.map((o) => (o.id === order.id ? { ...o, status: "collected" } : o)));
      return true;
    },
    [orders, deals]
  );

  // orders that are not collected in time are cancelled and the plates go back on sale
  useEffect(() => {
    const tick = setInterval(() => {
      const nowTs = Date.now();
      const expired = orders.filter((o) => o.status === "confirmed" && o.collectBy && o.collectBy < nowTs);
      if (!expired.length) return;
      setOrders((cur) =>
        cur.map((o) =>
          expired.some((e) => e.id === o.id) ? { ...o, status: "cancelled", refund: "Not collected in time. Order cancelled." } : o
        )
      );
      setDeals((cur) =>
        cur.map((d) => {
          const back = expired.filter((o) => o.dealId === d.id).reduce((n, o) => n + o.qty, 0);
          return back ? { ...d, stock: d.stock + back } : d;
        })
      );
    }, 15000);
    return () => clearInterval(tick);
  }, [orders]);

  const value = useMemo(
    () => ({
      deals, orders, savedIds,
      getDeal, getOrder, isSaved, toggleSaved, reserve, cancelOrder, markCollected,
      store, registerStore, approveStore,
      menu, addMenuItem, updateMenuItem, removeMenuItem,
      addDeal, updateDeal, removeDeal, verifyPickup,
    }),
    [deals, orders, savedIds, getDeal, getOrder, isSaved, toggleSaved, reserve, cancelOrder, markCollected, store, registerStore, approveStore, menu, addMenuItem, updateMenuItem, removeMenuItem, addDeal, updateDeal, removeDeal, verifyPickup]
  );

  return <DealsContext.Provider value={value}>{children}</DealsContext.Provider>;
}

export function useDeals() {
  const ctx = useContext(DealsContext);
  if (!ctx) throw new Error("useDeals must be used inside <DealsProvider>");
  return ctx;
}
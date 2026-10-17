import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { Text, TextInput } from "../components/AppText";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors, { shadow, softShadow } from "../theme/colors";
import { categories } from "../data/mockData";
import { useDeals } from "../store/DealsContext";
import DealCard from "../components/DealCard";
import { Plate, categoryLook } from "../components/Plate";
import { minutesLeft } from "../utils/time";
import { useAuth } from "../store/AuthContext";

// [tab name, outline icon, filled icon]
const TABS = [
  ["Home", "home-outline", "home"],
  ["Explore", "compass-outline", "compass"],
  ["Saved", "heart-outline", "heart"],
  ["Orders", "receipt-outline", "receipt"],
  ["Profile", "person-outline", "person"],
];

const SORTS = [
  ["closing", "Closing soon", "time-outline"],
  ["nearest", "Nearest", "navigate-outline"],
  ["cheapest", "Cheapest", "pricetag-outline"],
  ["discount", "Best discount", "flash-outline"],
];

const SORT_FN = {
  closing: (a, b) => (minutesLeft(a) ?? 9999) - (minutesLeft(b) ?? 9999),
  nearest: (a, b) => a.distanceKm - b.distanceKm,
  cheapest: (a, b) => a.price - b.price,
  discount: (a, b) => (b.original - b.price) / b.original - (a.original - a.price) / a.original,
};

const STATUS = {
  confirmed: { label: "Ready for pickup", bg: colors.successSoft, fg: colors.success },
  collected: { label: "Collected", bg: colors.field, fg: colors.textMuted },
  cancelled: { label: "Cancelled", bg: colors.dangerSoft, fg: colors.danger },
};

function Empty({ icon, title, text }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={34} color={colors.primary} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {!!text && <Text style={s.emptyText}>{text}</Text>}
    </View>
  );
}

// Zomato-style filter chip: white with grey border, active = light red tint + red border/text
function Pill({ label, icon, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.pill, active && s.pillOn]}>
      {!!icon && <Ionicons name={icon} size={14} color={active ? colors.primary : colors.textMuted} />}
      <Text style={[s.pillText, active && { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

export default function MainScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardW = Math.floor((width - 40 - 14) / 2);
  const { deals, orders, savedIds, isSaved, toggleSaved, getDeal, store } = useDeals();
  const { user, displayName, signOut } = useAuth();
  const initial = displayName.charAt(0).toUpperCase();

  const [tab, setTab] = useState(route?.params?.tab || "Home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("closing");
  const [vegOnly, setVegOnly] = useState(false);
  const [now, setNow] = useState(Date.now());

  // refresh the "closes in" countdowns
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // other screens can jump to a tab: navigation.navigate("Main", { tab: "Orders" })
  useEffect(() => {
    if (route?.params?.tab) setTab(route.params.tab);
  }, [route?.params?.tab]);

  // search only; hides ended and sold-out deals
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    const live = deals.filter((d) => d.stock > 0 && (minutesLeft(d, new Date(now)) ?? 1) > 0);
    if (!q) return live;
    return live.filter(
      (d) => d.name.toLowerCase().includes(q) || d.shop.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
    );
  }, [deals, search, now]);

  // search + category + veg + sort (Home)
  const list = useMemo(() => {
    const filtered = searched.filter((d) => (category === "All" || d.category === category) && (!vegOnly || d.veg));
    return [...filtered].sort(SORT_FN[sort]);
  }, [searched, category, vegOnly, sort]);

  const closingSoon = useMemo(
    () => searched.filter((d) => (minutesLeft(d, new Date(now)) ?? 999) <= 60).length,
    [searched, now]
  );

  const openDeal = (deal) => navigation.navigate("DealDetails", { dealId: deal.id });
  const renderDeal = (deal) => (
    <DealCard
      key={deal.id}
      deal={deal}
      now={now}
      width={cardW}
      saved={isSaved(deal.id)}
      onPress={() => openDeal(deal)}
      onToggleSave={() => toggleSaved(deal.id)}
    />
  );
  const grid = (items) => <View style={s.grid}>{items.map(renderDeal)}</View>;

  const noResults = <Empty icon="search-outline" title="No deals found" text="Try another category or search." />;

  /* ---------- tabs ---------- */
  const renderHome = () => (
    <>
      {closingSoon > 0 && !search.trim() && (
        <View style={s.banner}>
          <View style={s.bannerCircleA} />
          <View style={s.bannerCircleB} />
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={s.bannerTitle}>
              {closingSoon} deal{closingSoon > 1 ? "s" : ""} closing within the hour
            </Text>
            <Pressable
              style={s.bannerBtn}
              onPress={() => {
                setSort("closing");
                setCategory("All");
              }}
            >
              <Text style={s.bannerBtnText}>See deals</Text>
            </Pressable>
          </View>
          <Plate deal={{ category: "Meals" }} size={92} />
        </View>
      )}

      <Text style={s.section}>What's on your mind?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catContent}>
        {categories.map((c) => {
          const on = category === c;
          return (
            <Pressable key={c} onPress={() => setCategory(c)} style={s.cat}>
              <View style={[s.catCircle, on && s.catCircleOn]}>
                <Text style={{ fontSize: 28 }}>{categoryLook(c).emoji}</Text>
              </View>
              <Text style={[s.catText, on && s.catTextOn]} numberOfLines={1}>{c}</Text>
              <View style={[s.catUnderline, on && { backgroundColor: colors.primary }]} />
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={s.sectionRow}>
        <Text style={s.section}>Available now</Text>
        <Text style={s.count}>{list.length} deals</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pills} contentContainerStyle={s.rowGap}>
        {SORTS.map(([key, label, icon]) => (
          <Pill key={key} label={label} icon={icon} active={sort === key} onPress={() => setSort(key)} />
        ))}
        <Pill label="Veg only" icon="leaf-outline" active={vegOnly} onPress={() => setVegOnly((v) => !v)} />
      </ScrollView>

      {list.length ? grid(list) : noResults}
    </>
  );

  const renderExplore = () => {
    const groups = categories
      .filter((c) => c !== "All")
      .map((c) => [c, searched.filter((d) => d.category === c)])
      .filter(([, items]) => items.length);
    if (!groups.length) return noResults;
    return groups.map(([c, items]) => (
      <View key={c} style={{ marginBottom: 6 }}>
        <Text style={s.section}>{c}</Text>
        {grid(items)}
      </View>
    ));
  };

  const renderSaved = () => {
    const saved = deals.filter((d) => savedIds.includes(d.id) && d.stock > 0 && (minutesLeft(d, new Date(now)) ?? 1) > 0);
    return saved.length ? grid(saved) : <Empty icon="heart-outline" title="Nothing saved yet" text="Tap the heart on a deal to keep it here." />;
  };

  const orderCard = (o) => {
    const deal = getDeal(o.dealId);
    if (!deal) return null;
    const st = STATUS[o.status];
    return (
      <View key={o.id} style={[s.orderCard, softShadow]}>
        <View style={s.orderTop}>
          <Plate deal={deal} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={s.orderName} numberOfLines={1}>{deal.name}</Text>
            <Text style={s.orderMeta}>{deal.shop}</Text>
            <Text style={s.orderMeta}>{o.qty} plate{o.qty > 1 ? "s" : ""} · ₹{o.total}</Text>
          </View>
        </View>
        <View style={s.orderMid}>
          <View style={[s.badge, { backgroundColor: st.bg }]}>
            <Text style={[s.badgeText, { color: st.fg }]}>{st.label}</Text>
          </View>
          <Text style={s.orderMeta}>#{o.id}</Text>
        </View>
        {o.status === "confirmed" && (
          <>
            <View style={s.metaRow}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={s.orderMeta}>Today, {deal.pickupStart} – {deal.pickupEnd}</Text>
            </View>
            <Pressable style={s.primaryBtn} onPress={() => navigation.navigate("Pickup", { orderId: o.id })}>
              <Text style={s.primaryBtnText}>Show pickup code</Text>
            </Pressable>
          </>
        )}
        {o.status === "cancelled" && !!o.refund && <Text style={[s.orderMeta, { color: colors.danger }]}>{o.refund}</Text>}
      </View>
    );
  };

  const renderOrders = () => {
    if (!orders.length) return <Empty icon="receipt-outline" title="No orders yet" text="Your pickup codes will show up here." />;
    const upcoming = orders.filter((o) => o.status === "confirmed");
    const past = orders.filter((o) => o.status !== "confirmed");
    return (
      <>
        {upcoming.length > 0 && <Text style={s.section}>Upcoming pickups</Text>}
        {upcoming.map(orderCard)}
        {past.length > 0 && <Text style={[s.section, { marginTop: 8 }]}>Past orders</Text>}
        {past.map(orderCard)}
      </>
    );
  };

  const renderProfile = () => {
    const active = orders.filter((o) => o.status !== "cancelled");
    const plates = active.reduce((n, o) => n + o.qty, 0);
    const money = active.reduce((n, o) => n + o.saved, 0);
    const soon = (what) => () => Alert.alert(what, "Coming soon.");
    return (
      <>
        <View style={[s.profileCard, softShadow]}>
          <View style={s.avatarBig}>
            <Text style={s.avatarBigText}>{initial}</Text>
          </View>
          <View>
            <Text style={s.profileName}>{displayName}</Text>
            <Text style={s.orderMeta}>{user?.email}</Text>
          </View>
        </View>
        <View style={s.statsRow}>
          <View style={[s.stat, { backgroundColor: colors.primarySoft }]}>
            <Text style={[s.statNum, { color: colors.primary }]}>{plates}</Text>
            <Text style={[s.statLabel, { color: colors.primary }]}>plates rescued</Text>
          </View>
          <View style={[s.stat, { backgroundColor: colors.accentSoft }]}>
            <Text style={[s.statNum, { color: colors.accentText }]}>₹{money}</Text>
            <Text style={[s.statLabel, { color: colors.accentText }]}>saved</Text>
          </View>
        </View>

        <Pressable
          style={[s.menuRow, { backgroundColor: colors.primary, borderColor: colors.primary }]}
          onPress={() => navigation.navigate(store?.status === "verified" ? "StoreDashboard" : "StoreOnboarding")}
        >
          <View style={[s.menuIcon, { backgroundColor: "rgba(255,255,255,0.22)" }]}>
            <Ionicons name="storefront-outline" size={20} color={colors.onPrimary} />
          </View>
          <Text style={[s.menuText, { color: colors.onPrimary }]}>
            {!store ? "Register your store" : store.status === "verified" ? "Switch to store mode" : "Store verification pending"}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.onPrimary} />
        </Pressable>

        {[
          ["notifications-outline", "Notifications"],
          ["chatbubble-ellipses-outline", "Help & support"],
          ["document-text-outline", "Terms of service"],
          ["lock-closed-outline", "Privacy policy"],
        ].map(([icon, label]) => (
          <Pressable key={label} style={s.menuRow} onPress={soon(label)}>
            <View style={s.menuIcon}>
              <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
            <Text style={s.menuText}>{label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
        <Pressable style={s.menuRow} onPress={async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}>
          <View style={[s.menuIcon, { backgroundColor: colors.dangerSoft }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          </View>
          <Text style={[s.menuText, { color: colors.danger }]}>Log out</Text>
        </Pressable>
      </>
    );
  };

  const body = { Home: renderHome, Explore: renderExplore, Saved: renderSaved, Orders: renderOrders, Profile: renderProfile }[tab]();
  const hasSearch = tab === "Home" || tab === "Explore";

  /* ---------- top blocks ---------- */
  const header = hasSearch ? (
    <View style={s.header}>
      <Pressable style={s.locationBtn} onPress={() => Alert.alert("Location", "Coming soon.")}>
        <Ionicons name="location-sharp" size={28} color={colors.primary} />
        <View>
          <View style={s.locRow}>
            <Text style={s.locTitle}>Sector 17</Text>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </View>
          <Text style={s.locLabel} numberOfLines={1}>Chandigarh · Pickup near you</Text>
        </View>
      </Pressable>
      <Pressable style={s.avatar} onPress={() => setTab("Profile")}>
        <Text style={s.avatarText}>{initial}</Text>
      </Pressable>
    </View>
  ) : (
    <Text style={s.pageTitle}>{tab}</Text>
  );

  // this whole block sticks to the top while scrolling
  const searchBar = hasSearch ? (
    <View style={s.stickyWrap}>
      <View style={[s.search, softShadow]}>
        <Ionicons name="search" size={20} color={colors.primary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder='Search "dal", "samosa" or a shop'
          placeholderTextColor={colors.textMuted}
          style={s.searchInput}
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch("")} hitSlop={10}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : (
          <View style={s.micWrap}>
            <Ionicons name="mic-outline" size={20} color={colors.primary} />
          </View>
        )}
      </View>
    </View>
  ) : (
    <View />
  );

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        stickyHeaderIndices={hasSearch ? [1] : undefined}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {header}
        {searchBar}
        <View style={s.content}>{body}</View>
      </ScrollView>

      <View style={[s.tabs, shadow, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map(([name, outline, filled]) => {
          const on = tab === name;
          const badge = name === "Orders" ? orders.filter((o) => o.status === "confirmed").length : name === "Saved" ? savedIds.length : 0;
          return (
            <Pressable key={name} style={s.tab} onPress={() => setTab(name)}>
              <View style={s.tabIconWrap}>
                <Ionicons name={on ? filled : outline} size={24} color={on ? colors.primary : colors.textMuted} />
                {badge > 0 && (
                  <View style={s.tabBadge}>
                    <Text style={s.tabBadgeText}>{badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[s.tabText, on && { color: colors.primary, fontWeight: "700" }]}>{name}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // header + sticky search
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationBtn: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  locLabel: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locTitle: { fontSize: 17, fontWeight: "700", color: colors.text, letterSpacing: -0.2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  avatarText: { fontSize: 16, fontWeight: "700", color: colors.primary },
  pageTitle: { fontSize: 24, fontWeight: "700", color: colors.text, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, letterSpacing: -0.4 },
  stickyWrap: { backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 12 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 12, paddingHorizontal: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 },
  micWrap: { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: colors.border },

  // content
  content: { paddingHorizontal: 20, paddingTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  rowGap: { gap: 8, paddingRight: 20 },
  pills: { marginHorizontal: -20, paddingLeft: 20, marginBottom: 14, flexGrow: 0 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: "600", color: colors.text },

  banner: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", marginBottom: 20, overflow: "hidden" },
  bannerCircleA: { position: "absolute", width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(255,255,255,0.10)", right: -40, top: -60 },
  bannerCircleB: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.08)", left: 120, bottom: -60 },
  bannerTitle: { fontSize: 19, fontWeight: "700", color: colors.onPrimary, lineHeight: 25 },
  bannerBtn: { alignSelf: "flex-start", backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 14 },
  bannerBtnText: { color: colors.primary, fontWeight: "700", fontSize: 13 },

  section: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12, letterSpacing: -0.2 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  count: { fontSize: 13, fontWeight: "600", color: colors.textMuted },

  // categories: round icon with label + underline (Zomato style)
  catScroll: { marginHorizontal: -20, flexGrow: 0, marginBottom: 16 },
  catContent: { gap: 14, paddingHorizontal: 20, paddingVertical: 4 },
  cat: { width: 72, alignItems: "center", gap: 6 },
  catCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.cardAlt, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "transparent" },
  catCircleOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  catText: { fontSize: 12, fontWeight: "500", color: colors.textMuted, textAlign: "center" },
  catTextOn: { color: colors.primary, fontWeight: "700" },
  catUnderline: { height: 3, width: 28, borderRadius: 2, backgroundColor: "transparent" },

  empty: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginTop: 14 },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 6 },

  // orders
  orderCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  orderTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  orderName: { fontSize: 16, fontWeight: "700", color: colors.text },
  orderMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  orderMid: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 13, alignItems: "center", marginTop: 14 },
  primaryBtnText: { color: colors.onPrimary, fontWeight: "700", fontSize: 14 },

  // profile
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border },
  avatarBig: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarBigText: { fontSize: 24, fontWeight: "700", color: colors.primary },
  profileName: { fontSize: 18, fontWeight: "700", color: colors.text },
  statsRow: { flexDirection: "row", gap: 12, marginVertical: 14 },
  stat: { flex: 1, borderRadius: 14, padding: 16 },
  statNum: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  menuIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  menuText: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text },

  // bottom tabs: flat white bar with hairline top border
  tabs: { flexDirection: "row", backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, paddingHorizontal: 6 },
  tab: { flex: 1, alignItems: "center", gap: 2 },
  tabIconWrap: { width: 46, height: 30, alignItems: "center", justifyContent: "center" },
  tabText: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },
  tabBadge: { position: "absolute", top: -3, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderWidth: 1.5, borderColor: colors.surface },
  tabBadgeText: { color: colors.onPrimary, fontSize: 9, fontWeight: "700" },
});
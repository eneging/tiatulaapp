"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Minus,
  Plus,
  X,
  User,
  ChefHat,
  Package,
  Bike,
  Home as HomeIcon,
  Phone,
  MessageCircle,
  Check,
  CheckCircle2,
  MapPin,
  Info,
  Lock,
  Star,
  ShieldCheck,
  Ticket,
  Receipt,
  Store,
  UtensilsCrossed,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { useState, useEffect } from "react";
import { products, branches } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Login from "@/components/login";
import type { Customer } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Colores de la Marca                                                */
/* ------------------------------------------------------------------ */
const BRAND = {
  orange: "#FF7A00",
  orangeSoft: "#FF9A30",
  orangeDark: "#FF6600",
  green: "#8BCB00",
  greenSoft: "#A8DC00",
  cream: "#F9F6F1",
  creamCard: "#FFF9F3",
  peach: "#FFE5CC",
  brown: "#3B1D0F",
  brownSoft: "#8B7355",
};

const SHEET_SHADOW = "0 -12px 30px -18px rgba(59,29,15,0.18)";

type View = "home" | "pedido" | "catalog" | "delivery_mode" | "payment" | "tracking";
type DeliveryMode = "delivery" | "pickup" | "dine_in";
type PaymentMethod = "tarjeta" | "yape" | "plin" | "efectivo";
type TrackingStep = "preparing" | "ready" | "assigned" | "in_transit" | "delivered";

const STEP_OF_VIEW: Record<View, number> = {
  home: 1,
  pedido: 2,
  catalog: 2,
  delivery_mode: 3,
  payment: 4,
  tracking: 5,
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  tarjeta: "Tarjeta",
  yape: "Yape",
  plin: "Plin",
  efectivo: "Efectivo",
};

const CATEGORY_TABS = [
  { id: "all", label: "Todos" },
  { id: "individuales", label: "Individuales" },
  { id: "antojos", label: "Antojos" },
  { id: "promociones", label: "Promociones" },
  { id: "extras", label: "Extras" },
  { id: "bebidas", label: "Bebidas" },
  { id: "postres", label: "Postres" },
  { id: "salsas", label: "Salsas" },
  { id: "acomp", label: "Acompañamientos" },
];

export default function AppShell() {
  // ESTADOS PRINCIPALES
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showLogin, setShowLogin] = useState<boolean>(false); // Controla si mostramos la pantalla de login
  
  const [view, setView] = useState<View>("home");
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("tarjeta");
  const [address, setAddress] = useState<string>("Av. Primavera 456, Piso 2 · Urb. El Sol");
  const [cartOpen, setCartOpen] = useState(false);
  const [trackingStep, setTrackingStep] = useState<TrackingStep>("preparing");
  const [orderNumber] = useState<string>("A-1024");
  const [pickupCode] = useState<string>("T-582");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showGateway, setShowGateway] = useState(false);

  const PAYMENT_PROCESSING_TEXT: Record<PaymentMethod, string> = {
    tarjeta: "Procesando pago con tarjeta…",
    yape: "Confirmando tu Yapeo…",
    plin: "Confirmando tu Plineo…",
    efectivo: "Registrando pago en efectivo…",
  };

  const stepsForMode: TrackingStep[] =
    deliveryMode === "delivery"
      ? ["preparing", "ready", "assigned", "in_transit", "delivered"]
      : deliveryMode === "pickup"
        ? ["preparing", "ready"]
        : ["preparing"]; 

  const trackingLabels: Record<TrackingStep, string> = {
    preparing: "Preparando tu pedido",
    ready: deliveryMode === "pickup" ? "Listo para recoger" : "Pedido recogido",
    assigned: "Repartidor asignado",
    in_transit: "En ruta a tu domicilio",
    delivered: "Entregado",
  };
  
  const trackingDescriptions: Record<TrackingStep, string> = {
    preparing: "Tu orden se está preparando con amor",
    ready: deliveryMode === "pickup" ? "Puedes pasar a recogerlo cuando gustes" : "Tu pedido fue recogido en tienda",
    assigned: "Nuestro repartidor va en camino",
    in_transit: "Estamos cerca de tu ubicación",
    delivered: "Pronto disfrutarás tu pedido",
  };
  
  const trackingIcons: Record<TrackingStep, React.ElementType> = {
    preparing: ChefHat,
    ready: deliveryMode === "pickup" ? Ticket : Package,
    assigned: Bike,
    in_transit: Bike,
    delivered: HomeIcon,
  };

  const getProgressPercentage = (step: TrackingStep) => {
    switch(step) {
      case "preparing": return 10;
      case "ready": return 25;
      case "assigned": return 50;
      case "in_transit": return 75;
      case "delivered": return 100;
      default: return 0;
    }
  };

  useEffect(() => {
    if (view !== "tracking" || deliveryMode === "dine_in") return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
      if (secondsElapsed % 5 === 0 && secondsElapsed > 0) {
        const currentIndex = stepsForMode.indexOf(trackingStep);
        if (currentIndex < stepsForMode.length - 1) {
          setTrackingStep(stepsForMode[currentIndex + 1]);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [view, trackingStep, secondsElapsed, deliveryMode]);

  const filteredProducts = products.filter(product => {
    if (activeCategory === "all") return true;
    return product.category === activeCategory; 
  });

  const cartItems = products.filter((product) => cart[product.id]);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0);
  const deliveryFee = deliveryMode === "delivery" && subtotal > 0 ? 4 : 0;
  const total = subtotal + deliveryFee;
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (id: string) => setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const updated = (next[id] ?? 0) + delta;
      if (updated <= 0) delete next[id];
      else next[id] = updated;
      return next;
    });
  };

  // NUEVO: Pide login obligatoriamente antes de elegir delivery/pago
  const handleProceedToCheckout = () => {
    if (!customer) {
      setCartOpen(false);
      setShowLogin(true); // Abre la pantalla de login
    } else {
      setCartOpen(false);
      setView("delivery_mode");
    }
  };

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setPaymentSuccess(false);
    
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowGateway(false);
        setView("tracking");
        setTrackingStep("preparing");
        setSecondsElapsed(0);
      }, 1500);
    }, 2000);
  };

  const startNewOrder = () => {
    setView("home");
    setCart({}); // Vaciamos el carrito al terminar todo el flujo
    setShowGateway(false);
    setTrackingStep("preparing");
    setSecondsElapsed(0);
  };

  const goToCatalog = (category: string) => {
    setActiveCategory(category);
    setView("catalog");
  };

  // ==========================================
  // FUNCIONES DE CONTACTO AL REPARTIDOR
  // ==========================================
  const handleCallRider = () => {
    // Abre el teclado de llamadas del celular
    window.open("tel:+51932563713", "_self");
  };

  const handleWhatsAppRider = () => {
    // 1. Formateamos la lista de items
    const itemsList = cartItems.map(item => `${cart[item.id]}x ${item.name}`).join('%0A• ');
    
    // 2. Evaluamos si es efectivo u otro medio para el mensaje
    const paymentStatusString = paymentMethod === "efectivo" 
      ? "Pago pendiente contra entrega (Efectivo)" 
      : `Pagado con ${PAYMENT_LABELS[paymentMethod]}`;

    // 3. Creamos el mensaje integrando los datos del cliente logueado
    const text = `¡Hola Carlos! Soy *${customer?.name}*.%0ATe escribo para coordinar la entrega de mi pedido *#${orderNumber}*.%0A%0A*🧾 Detalle de mi compra:*%0A• ${itemsList}%0A%0A*💰 Total:* S/ ${total.toFixed(2)}%0A*✅ Estado:* ${paymentStatusString}%0A%0A¿En cuánto tiempo aproximado estarías llegando a mi ubicación?`;
    
    // 4. Abrimos WhatsApp
    window.open(`https://wa.me/51932563713?text=${text}`, "_blank");
  };

  // Si el usuario presionó "Continuar" pero no está logueado, mostramos Login
  if (showLogin && !customer) {
    return (
      <Login
        onLoginSuccess={(data) => {
          setCustomer({ id: Math.random().toString(36).substr(2, 9), name: data.name, email: data.email, phone: data.phone });
          setShowLogin(false);
          setView("delivery_mode"); // Lo enviamos directo al siguiente paso
        }}
      />
    );
  }

  const currentStep = STEP_OF_VIEW[view];

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mt-6">
      <span className="text-sm font-bold" style={{ color: BRAND.green }}>
        {currentStep} de 5
      </span>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="rounded-full transition-all"
            style={{
              height: n === currentStep ? 12 : 10,
              width: n === currentStep ? 12 : 10,
              backgroundColor: n === currentStep ? BRAND.green : BRAND.peach,
            }}
          />
        ))}
      </div>
    </div>
  );

  const Logo = () => (
    <motion.img
      src="https://res.cloudinary.com/dhuggiq9q/image/upload/v1783316731/Dise%C3%B1o_sin_t%C3%ADtulo_3_tdzqiz.png"
      alt="La Tía Tula Logo"
      className="h-44 w-44 sm:h-52 sm:w-52 object-contain drop-shadow-lg"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  );

  const RoundIcon = ({ icon: Icon, active, tone = BRAND.orange }: { icon: React.ElementType; active: boolean; tone?: string; }) => (
    <div
      className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        backgroundColor: active ? tone : "white",
        border: active ? "none" : `2px solid ${BRAND.peach}`,
        color: active ? "white" : BRAND.brownSoft,
      }}
    >
      <Icon size={16} />
    </div>
  );

  const SheetHeader = () => (
    <div className="relative pt-8">
      <div className="relative z-10 flex flex-col items-center justify-center pt-6">
        <Logo />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" 
      style={{ 
        backgroundColor: BRAND.cream,
        backgroundImage: "url('https://res.cloudinary.com/dhuggiq9q/image/upload/v1783363000/Gemini_Generated_Image_upx6lmupx6lmupx6_zti4fc.png')", 
        backgroundRepeat: "repeat",
        backgroundSize: "400px", 
        backgroundAttachment: "fixed", 
        backgroundBlendMode: "multiply", 
        color: BRAND.brown 
      }}>
      <div className="mx-auto relative flex min-h-screen max-w-2xl flex-col">
        
        {/* Floating actions */}
        <div className="fixed top-5 left-5 right-5 z-40 flex items-center justify-between gap-2">
          <div
            className="rounded-full bg-white/95 backdrop-blur px-4 py-2.5 shadow-md border"
            style={{ borderColor: BRAND.peach }}
          >
            <p className="text-sm font-bold leading-none" style={{ color: BRAND.orange }}>
              ¡Hola, {customer ? customer.name.split(" ")[0] : "Invitado"}!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition"
              style={{ backgroundColor: BRAND.orange }}
              aria-label="Ver carrito"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
                  style={{ backgroundColor: BRAND.green }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (!customer) setShowLogin(true);
                else { setCustomer(null); setView("home"); setCart({}); } // Cerrar sesión si ya está logueado
              }}
              className="h-11 w-11 rounded-full border flex items-center justify-center bg-white shadow-md transition"
              style={{ borderColor: BRAND.peach }}
              aria-label="Cuenta"
            >
              <User size={18} style={{ color: BRAND.orange }} />
            </button>
          </div>
        </div>

        {/* Payment simulation overlay */}
        <AnimatePresence>
          {(isProcessingPayment || paymentSuccess) && (
            <motion.div
              key="payment-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-[28px] bg-white p-8 text-center max-w-xs w-full shadow-2xl"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: BRAND.orange }} />
                    <p className="font-bold" style={{ color: BRAND.brown }}>
                      {PAYMENT_PROCESSING_TEXT[paymentMethod]}
                    </p>
                    <p className="text-xs mt-2" style={{ color: BRAND.brownSoft }}>
                      No cierres esta ventana
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: "#E8F7D0", color: "#5A8A00" }}
                    >
                      <PartyPopper size={28} />
                    </motion.div>
                    <p className="font-bold" style={{ color: BRAND.brown }}>
                      ¡Pago exitoso!
                    </p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto pt-4">
          <AnimatePresence mode="wait">
            
            {/* ============================================================ */}
            {/* STEP 1 · Elige tu local                                      */}
            {/* ============================================================ */}
            {view === "home" && (
              <motion.section key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pb-8">
                <div className="relative pt-2 ">
                  <div className="relative z-10 flex flex-col items-center justify-center pt-6 ">
                    <img src="https://res.cloudinary.com/dhuggiq9q/image/upload/v1783316731/Dise%C3%B1o_sin_t%C3%ADtulo_3_tdzqiz.png" className="w-[200px]" alt="La Tía Tula" />
                  </div>
                </div>

                <div className="px-6 space-y-6 bg-white p-1 rounded-t-4xl mt-6" style={{ boxShadow: SHEET_SHADOW }}>
                  <StepIndicator />
                  <div className="text-center mt-5 px-6">
                    <h2 className="text-3xl font-bold">Elige tu local</h2>
                    <p className="text-sm" style={{ color: BRAND.brownSoft }}>Primer paso para continuar con tu pedido</p>
                  </div>

                  {branches.map((branch, idx) => {
                    const isSelected = selectedBranch.id === branch.id;
                    const accent = idx === 0 ? BRAND.orange : BRAND.green;
                    return (
                      <motion.div
                        key={branch.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-3xl p-5 flex items-center justify-between bg-white border-2 transition-all cursor-pointer"
                        style={{ borderColor: isSelected ? BRAND.orange : BRAND.peach, boxShadow: isSelected ? "0 10px 25px -10px rgba(255,122,0,0.35)" : undefined }}
                        onClick={() => setSelectedBranch(branch)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="h-12 w-12 rounded-full flex items-center justify-center shadow-md flex-shrink-0 text-white"
                            style={{ background: `linear-gradient(135deg, ${accent}, ${idx === 0 ? BRAND.orangeSoft : BRAND.greenSoft})` }}
                          >
                            <MapPin size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm">{branch.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: BRAND.brownSoft }}>
                              {branch.address}
                            </p>
                          </div>
                        </div>
                        <button
                          className="rounded-full px-5 py-2.5 font-bold text-sm text-white transition-all whitespace-nowrap ml-4 flex items-center gap-1.5"
                          style={{ backgroundColor: accent }}
                        >
                          {isSelected ? (<><Check size={15} /> Seleccionado</>) : ("Seleccionar")}
                        </button>
                      </motion.div>
                    );
                  })}

                  <div className=" rounded-3xl p-5 border-2 flex gap-4 items-start " style={{ background: `linear-gradient(135deg, #E8F7D0, #F0FBE0)`, borderColor: "#D1EBA8" }}>
                    <Info size={20} className="flex-shrink-0 mt-0.5" style={{ color: "#5A8A00" }} />
                    <p className="text-xs font-semibold">Selecciona tu local para ver el menú disponible y los tiempos de entrega.</p>
                  </div>

                  <div className="relative px-6 pb-4 pt-4">
                    <Button
                      className="w-full h-14 text-lg font-bold rounded-full text-white shadow-lg disabled:opacity-50"
                      style={{ background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.orangeSoft})` }}
                      disabled={!selectedBranch}
                      onClick={() => setView("pedido")}
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ============================================================ */}
            {/* STEP 2 · Elige tu pedido (combo + categorías)                */}
            {/* ============================================================ */}
            {view === "pedido" && (
              <motion.section key="pedido" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pb-8">
                <SheetHeader />

                <div className="px-4 md:px-6 space-y-4 bg-white p-1 rounded-t-4xl max-w-3xl mx-auto" style={{ boxShadow: SHEET_SHADOW }}>
                  <StepIndicator />
                  
                  <div className="text-center mt-3 px-6 mb-2">
                    <h2 className="text-[28px] md:text-3xl font-extrabold mb-1" style={{ color: '#4A2B1D' }}>Elige tu pedido</h2>
                    <p className="text-[13px] md:text-[15px]" style={{ color: BRAND.brownSoft }}>
                      Encuentra tu favorito y continúa con tu pedido
                    </p>
                  </div>

                  {/* Tarjeta Destacada */}
                  <button
                    onClick={() => addToCart("1")} // ID adaptado según tu data.ts
                    className="w-full text-left rounded-[20px] p-4 md:p-6 bg-[#FFFBF4] border border-orange-100 relative overflow-hidden min-h-[200px] md:min-h-[240px] shadow-sm transition-transform active:scale-95 flex items-center"
                  >
                    <div className="relative z-10 w-[45%] md:w-[50%]">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md text-white mb-2"
                        style={{ backgroundColor: BRAND.orange }}
                      >
                        <Star size={10} fill="white" strokeWidth={0} /> Más pedido
                      </span>
                      <h3 className="text-[22px] md:text-3xl font-extrabold leading-none mb-1" style={{ color: '#4A2B1D' }}>
                        Combo <br />
                        <span style={{ color: '#7EB100' }}>Familiar</span>
                      </h3>
                      <p className="text-[10px] md:text-xs mt-1.5 leading-[1.3] bg-white/50 backdrop-blur-sm rounded-md p-1" style={{ color: '#6B5A4B' }}>
                        1 Pollo a la brasa + Papas<br />
                        + Ensalada + Salsas<br />
                        + Gaseosa 1.5 L
                      </p>
                      <div className="mt-2 md:mt-4">
                        <p className="text-[10px] md:text-xs" style={{ color: '#6B5A4B' }}>Desde</p>
                        <p className="text-[22px] md:text-[28px] font-black -mt-1" style={{ color: BRAND.orange }}>
                          <span className="text-sm md:text-base">S/</span> 74.90
                        </p>
                      </div>
                    </div>
                    <div className="absolute right-[-25px] bottom-[-25px] md:right-[-40px] md:bottom-[-40px] w-[280px] md:w-[400px] z-0 pointer-events-none">
                      <img 
                        src="https://res.cloudinary.com/dhuggiq9q/image/upload/v1783346149/ChatGPT_Image_6_jul_2026_08_53_56_ottwkh_n433xu.png" 
                        alt="Combo Familiar" 
                        className="w-full h-full object-contain object-bottom drop-shadow-md" 
                      />
                    </div>
                    <div 
                      className="absolute bottom-3 right-3 md:bottom-5 md:right-5 z-20 rounded-full shadow-md flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white hover:scale-105 transition-transform"
                      style={{ backgroundColor: BRAND.orange }}
                    >
                      <Plus size={20} strokeWidth={3} className="md:w-6 md:h-6" />
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-3 md:gap-5 mt-4">
                    <button onClick={() => goToCatalog("individuales")} className="text-left rounded-2xl p-3 md:p-5 bg-white border border-gray-200 relative overflow-hidden min-h-[150px] md:min-h-[180px] shadow-sm hover:shadow-md transition-all active:scale-95">
                      <div className="relative z-10 w-[55%] bg-white/40 backdrop-blur-[2px] rounded-md pb-1">
                        <p className="font-bold text-[14px] md:text-lg leading-tight" style={{ color: '#4A2B1D' }}>Individuales</p>
                        <p className="text-[10px] md:text-xs leading-tight mt-0.5" style={{ color: '#7EB100' }}>Porciones perfectas<br/>para ti</p>
                      </div>
                      <img src="https://res.cloudinary.com/dhuggiq9q/image/upload/v1783360806/Dise%C3%B1o_sin_t%C3%ADtulo_8_bo3zhf.png" className="absolute -bottom-5 -right-5 w-[160px] md:w-[220px] object-contain drop-shadow-md pointer-events-none" alt="Individuales"/>
                      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-20 rounded-full shadow border border-gray-100 bg-white flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
                        <ArrowRight size={12} className="md:w-4 md:h-4" style={{ color: BRAND.orange }} />
                      </div>
                    </button>

                    <button onClick={() => goToCatalog("antojos")} className="text-left rounded-2xl p-3 md:p-5 bg-white border border-gray-200 relative overflow-hidden min-h-[150px] md:min-h-[180px] shadow-sm hover:shadow-md transition-all active:scale-95">
                      <div className="relative z-10 w-[55%] bg-white/40 backdrop-blur-[2px] rounded-md pb-1">
                        <p className="font-bold text-[14px] md:text-lg leading-tight" style={{ color: '#4A2B1D' }}>Según tu antojo</p>
                        <p className="text-[10px] md:text-xs leading-tight mt-0.5" style={{ color: '#7EB100' }}>Elige como<br/>más te gusta</p>
                      </div>
                      <img src="https://res.cloudinary.com/dhuggiq9q/image/upload/v1783360908/Dise%C3%B1o_sin_t%C3%ADtulo_9_wi5egw.png" className="absolute -bottom-5 -right-5 w-[160px] md:w-[220px] object-contain drop-shadow-md pointer-events-none" alt="Antojo"/>
                      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-20 rounded-full shadow border border-gray-100 bg-white flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
                        <ArrowRight size={12} className="md:w-4 md:h-4" style={{ color: BRAND.orange }} />
                      </div>
                    </button>

                    <button onClick={() => goToCatalog("promociones")} className="text-left rounded-2xl p-3 md:p-5 bg-white border border-gray-200 relative overflow-hidden min-h-[150px] md:min-h-[180px] shadow-sm hover:shadow-md transition-all active:scale-95">
                      <div className="relative z-10 w-[55%] bg-white/40 backdrop-blur-[2px] rounded-md pb-1">
                        <p className="font-bold text-[14px] md:text-lg leading-tight" style={{ color: '#4A2B1D' }}>Promociones</p>
                        <p className="text-[10px] md:text-xs leading-tight mt-0.5" style={{ color: '#7EB100' }}>Ofertas que<br/>te encantarán</p>
                        <span className="inline-block mt-2 px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold text-white rounded bg-[#7EB100] italic">
                          ¡PROMO DEL DÍA!
                        </span>
                      </div>
                      <img src="https://res.cloudinary.com/dhuggiq9q/image/upload/v1783361015/Dise%C3%B1o_sin_t%C3%ADtulo_10_vsjgzt.png" className="absolute -bottom-5 -right-5 w-[160px] md:w-[220px] object-contain drop-shadow-md pointer-events-none" alt="Promociones"/>
                      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-20 rounded-full shadow border border-gray-100 bg-white flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
                        <ArrowRight size={12} className="md:w-4 md:h-4" style={{ color: BRAND.orange }} />
                      </div>
                    </button>

                    <button onClick={() => goToCatalog("extras")} className="text-left rounded-2xl p-3 md:p-5 bg-white border border-gray-200 relative overflow-hidden min-h-[150px] md:min-h-[180px] shadow-sm hover:shadow-md transition-all active:scale-95">
                      <div className="relative z-10 w-[55%] bg-white/40 backdrop-blur-[2px] rounded-md pb-1">
                        <p className="font-bold text-[14px] md:text-lg leading-tight" style={{ color: '#4A2B1D' }}>Aguadito / Extras</p>
                        <p className="text-[10px] md:text-xs leading-tight mt-0.5" style={{ color: '#7EB100' }}>Sopas, acompañamientos<br/>y más</p>
                      </div>
                      <img src="https://res.cloudinary.com/dhuggiq9q/image/upload/v1783361174/Dise%C3%B1o_sin_t%C3%ADtulo_11_fv4wzm.png" className="absolute -bottom-5 -right-5 w-[160px] md:w-[220px] object-contain drop-shadow-md pointer-events-none" alt="Extras"/>
                      <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-20 rounded-full shadow border border-gray-100 bg-white flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
                        <ArrowRight size={12} className="md:w-4 md:h-4" style={{ color: BRAND.orange }} />
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-2 py-2 overflow-x-auto scrollbar-hide md:justify-center">
                    {[
                      { id: "bebidas", label: "Bebidas", img: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783357801/png-transparent-coca-cola-bottle-coca-cola-soft-drink-diet-coke-coca-cola-s-the-cocacola-company-cola-brands_ntnuq8_uuptnv.png" },
                      { id: "postres", label: "Postres", img: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783357924/deliciosa-rebanada-pastel-queso-bayas_191095-86319_drmopo_hdk9ei.avif" },
                      { id: "salsas", label: "Salsas", img: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783358143/ingrediente-salsa-chile_gjqbbq_hlzdj8.jpg" },
                      { id: "acomp", label: "Acomp.", img: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783358145/pngtree-french-fries-in-a-red-fast-food-carton-no-background-png-image_16584814_kxisqb_ensqld.png" }
                    ].map((pill) => (
                      <button
                        key={pill.label}
                        onClick={() => goToCatalog(pill.id)}
                        className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-gray-200 bg-white shadow-sm flex-shrink-0 hover:bg-gray-50 transition-colors"
                      >
                        <img src={pill.img} className="w-5 h-5 md:w-6 md:h-6 object-contain" alt={pill.label} />
                        <span className="text-[11px] md:text-[13px] font-semibold" style={{ color: '#4A2B1D' }}>{pill.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-6 pb-4">
                    <div className="flex gap-3">
                      <Button 
                        variant="secondary" 
                        className="flex-[0.4] h-14 md:h-16 rounded-full font-bold md:text-lg" 
                        onClick={() => setView("home")}
                      >
                        <ArrowLeft size={18} className="mr-1 md:w-6 md:h-6" /> Atrás
                      </Button>
                      <Button
                        className="flex-[0.6] h-14 md:h-16 text-lg md:text-xl font-bold rounded-full text-white shadow-lg disabled:opacity-50 transition-transform hover:scale-[1.02]"
                        style={{ background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.orangeSoft})` }}
                        disabled={totalItems === 0}
                        onClick={handleProceedToCheckout}
                      >
                        Continuar <ArrowRight size={20} className="ml-1 md:w-6 md:h-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ============================================================ */}
            {/* Catalog — Filtro Dinámico de Productos                       */}
            {/* ============================================================ */}
            {view === "catalog" && (
              <motion.section key="catalog" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pb-8">
                <SheetHeader />

                <div className="px-6 space-y-6 bg-white p-1 rounded-t-4xl" style={{ boxShadow: SHEET_SHADOW }}>
                  <StepIndicator />
                  
                  <div className="flex items-center gap-3 mt-5 mb-1">
                    <button
                      onClick={() => setView("pedido")}
                      className="h-10 w-10 rounded-full bg-white border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: BRAND.peach }}
                    >
                      <ArrowLeft size={18} style={{ color: BRAND.brownSoft }} />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold leading-tight">Catálogo</h2>
                      <p className="text-xs" style={{ color: BRAND.brownSoft }}>
                        Elige tus productos favoritos
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 py-2 overflow-x-auto scrollbar-hide">
                    {CATEGORY_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCategory(tab.id)}
                        className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border"
                        style={{
                          backgroundColor: activeCategory === tab.id ? BRAND.orange : "white",
                          color: activeCategory === tab.id ? "white" : BRAND.brownSoft,
                          borderColor: activeCategory === tab.id ? BRAND.orange : BRAND.peach,
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-10">
                      <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-bold" style={{ color: BRAND.brownSoft }}>No hay productos en esta categoría aún.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts.map((product) => (
                        <motion.div key={product.id} whileHover={{ y: -4 }} className="rounded-[24px] border-2 bg-white overflow-hidden" style={{ borderColor: BRAND.peach }}>
                          <div className="h-32 w-full relative flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${BRAND.peach}, #FDF3E7)`, color: BRAND.orange }}>
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                              <UtensilsCrossed size={36} />
                            )}
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-bold text-sm leading-tight flex-1">{product.name}</h4>
                                {product.badge && (
                                  <span className="whitespace-nowrap text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: BRAND.peach, color: BRAND.orange }}>
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px]" style={{ color: BRAND.brownSoft }}>
                                {product.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold" style={{ color: BRAND.orange }}>
                                S/ {product.price.toFixed(2)}
                              </p>
                              <button
                                onClick={() => addToCart(product.id)}
                                className="h-8 w-8 rounded-full text-white flex items-center justify-center"
                                style={{ backgroundColor: BRAND.orange }}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="pb-4">
                    <Button className="w-full h-14 text-lg font-bold rounded-full text-white shadow-md" style={{ backgroundColor: BRAND.orange }} onClick={() => setView("pedido")}>
                      Atrás
                    </Button>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ============================================================ */}
            {/* Drawer (Carrito Lateral / Modal)                             */}
            {/* ============================================================ */}
            <AnimatePresence>
              {cartOpen && (
                <motion.div key="cart-drawer" initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }} className="fixed inset-0 z-50 flex">
                  <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
                  <div className="w-full max-w-sm bg-white rounded-l-[32px] shadow-2xl p-6 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Tu carrito</h3>
                      <button onClick={() => setCartOpen(false)} className="p-2 rounded-full transition" style={{ backgroundColor: BRAND.creamCard }}>
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3">
                      {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
                          <div>
                            <ShoppingBag size={48} className="mx-auto opacity-40 mb-2" style={{ color: BRAND.brownSoft }} />
                            <p style={{ color: BRAND.brownSoft }}>Carrito vacío</p>
                          </div>
                          <button
                            onClick={() => { setCartOpen(false); setView("pedido"); }}
                            className="rounded-full px-5 py-2.5 font-bold text-sm text-white"
                            style={{ backgroundColor: BRAND.orange }}
                          >
                            Ver el menú
                          </button>
                        </div>
                      ) : (
                        cartItems.map((item) => (
                          <div key={item.id} className="rounded-[16px] p-3 flex items-center justify-between" style={{ backgroundColor: BRAND.creamCard }}>
                            <div className="flex-1 pr-2">
                              <p className="font-semibold text-sm leading-tight">{item.name}</p>
                              <p className="text-xs" style={{ color: BRAND.brownSoft }}>S/ {item.price.toFixed(2)} c/u</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7 rounded-full bg-white border flex items-center justify-center" style={{ borderColor: BRAND.peach }}>
                                <Minus size={14} />
                              </button>
                              <span className="w-6 text-center font-bold">{cart[item.id]}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="h-7 w-7 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: BRAND.orange }}>
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {cartItems.length > 0 && (
                      <>
                        <div className="border-t pt-4 space-y-2" style={{ borderColor: BRAND.peach }}>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: BRAND.brownSoft }}>Subtotal</span>
                            <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
                          </div>
                          {deliveryMode === "delivery" && (
                            <div className="flex justify-between text-sm">
                              <span style={{ color: BRAND.brownSoft }}>Delivery</span>
                              <span className="font-semibold">S/ {deliveryFee.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold" style={{ color: BRAND.orange }}>
                            <span>Total</span>
                            <span>S/ {total.toFixed(2)}</span>
                          </div>
                        </div>
                        <Button className="w-full h-12 rounded-full text-white" style={{ backgroundColor: BRAND.orange }} onClick={handleProceedToCheckout}>
                          {view === "home" || view === "pedido" || view === "catalog" ? "Elegir modalidad y pagar" : view === "delivery_mode" ? "Ir a pagar" : "Finalizar compra"}
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ============================================================ */}
            {/* STEP 3 · Modalidad de atención                               */}
            {/* ============================================================ */}
            {view === "delivery_mode" && (
              <motion.section key="delivery_mode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pb-8">
                <SheetHeader />
                <div className="px-6 space-y-4 bg-white p-1 rounded-t-4xl" style={{ boxShadow: SHEET_SHADOW }}>
                  <StepIndicator />
                  <div className="text-center mt-5 px-6 mb-2">
                    <h2 className="text-3xl font-bold mb-2">Modalidad de atención</h2>
                    <p className="text-sm" style={{ color: BRAND.brownSoft }}>Selecciona cómo deseas recibir tu pedido</p>
                  </div>

                  {[
                    { id: "delivery", name: "Delivery", desc: "Recíbelo en la puerta de tu casa", image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783344332/Dise%C3%B1o_sin_t%C3%ADtulo_4_wbvtaj.png", tint: "#FFE9D6" },
                    { id: "pickup", name: "Recojo en tienda", desc: "Pasa por tu pedido en el local", image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783344762/ChatGPT_Image_6_jul_2026_08_31_20_d1rx2s_f8koux.png", tint: "#EFEAE0" },
                    { id: "dine_in", name: "Consumo en tienda", desc: "Disfrútalo recién servido en el local", image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783345197/Dise%C3%B1o_sin_t%C3%ADtulo_5_fcfrcp.png", tint: "#FBE9D9" },
                  ].map((mode) => {
                    const selected = deliveryMode === mode.id;
                    return (
                      <motion.button
                        key={mode.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDeliveryMode(mode.id as DeliveryMode)}
                        className="w-full rounded-3xl p-3 flex items-center gap-4 bg-white border-2 transition-all"
                        style={{ borderColor: selected ? BRAND.orange : BRAND.peach, boxShadow: selected ? "0 10px 25px -10px rgba(255,122,0,0.35)" : undefined }}
                      >
                        <div className="h-16 w-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: mode.tint }}>
                          <img src={mode.image} alt={mode.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-bold">{mode.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: BRAND.brownSoft }}>{mode.desc}</p>
                        </div>
                        <RoundIcon icon={ArrowRight} active={selected} />
                      </motion.button>
                    );
                  })}

                  {deliveryMode === "delivery" && (
                    <div className="rounded-3xl p-5 border-2" style={{ background: `linear-gradient(135deg, ${BRAND.creamCard}, ${BRAND.peach})`, borderColor: BRAND.orange }}>
                      <p className="text-xs font-bold mb-3">Dirección de entrega</p>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-2xl border-2 bg-white px-4 py-3 font-medium text-sm focus:outline-none"
                        style={{ borderColor: BRAND.peach }}
                      />
                    </div>
                  )}

                  {deliveryMode === "pickup" && (
                    <div className="rounded-3xl p-5 border-2 flex gap-3 items-start" style={{ backgroundColor: BRAND.creamCard, borderColor: BRAND.peach }}>
                      <Store size={18} className="flex-shrink-0 mt-0.5" style={{ color: BRAND.orange }} />
                      <p className="text-xs font-semibold">Tu pedido estará listo para recoger en <span style={{ color: BRAND.orange }}>{selectedBranch.name}</span>. Te daremos un código para presentar en caja.</p>
                    </div>
                  )}

                  {deliveryMode === "dine_in" && (
                    <div className="rounded-3xl p-5 border-2 flex gap-3 items-start" style={{ backgroundColor: BRAND.creamCard, borderColor: BRAND.peach }}>
                      <UtensilsCrossed size={18} className="flex-shrink-0 mt-0.5" style={{ color: BRAND.orange }} />
                      <p className="text-xs font-semibold">Al pagar recibirás tu boleta al instante para presentarla en <span style={{ color: BRAND.orange }}>{selectedBranch.name}</span>.</p>
                    </div>
                  )}

                  <div className="relative mt-8 pb-4">
                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1 h-14 rounded-full" onClick={() => setView("pedido")}>
                        <ArrowLeft size={18} /> Atrás
                      </Button>
                      <Button
                        className="flex-1 h-14 text-lg font-bold rounded-full text-white shadow-lg"
                        style={{ background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.orangeSoft})` }}
                        onClick={() => setView("payment")}
                      >
                        Continuar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ============================================================ */}
            {/* STEP 4 · Selecciona tu método de pago y Simulación           */}
            {/* ============================================================ */}
            {view === "payment" && (
              <motion.section key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pb-8">
                <SheetHeader />
                <div className="px-6 space-y-4 bg-white p-1 rounded-t-4xl" style={{ boxShadow: SHEET_SHADOW }}>
                  <StepIndicator />

                  <AnimatePresence mode="wait">
                    {!showGateway ? (
                      /* --- PANTALLA A: SELECCIÓN DE MÉTODO --- */
                      <motion.div key="method-selection" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="text-center mt-5 px-6 mb-2">
                          <h2 className="text-3xl font-bold mb-2">Método de pago</h2>
                          <p className="text-sm" style={{ color: BRAND.brownSoft }}>
                            {deliveryMode === "dine_in" ? "Paga ahora y recibe tu boleta" : deliveryMode === "pickup" ? "Paga ahora y te daremos un ticket" : "Haz tu pago de manera segura"}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {[
                            { id: "tarjeta" as PaymentMethod, desc: "Visa, MasterCard y más", image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783343555/ChatGPT_Image_6_jul_2026_08_12_18_xhfnhk.png", tint: "#F2EFE8" },
                            { id: "yape" as PaymentMethod, desc: "Paga rápido desde tu celular", image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783342806/ChatGPT_Image_6_jul_2026_07_59_38_qpaqlz.png", tint: "#EFE6F7" },
                            { id: "plin" as PaymentMethod, desc: "Transferencia inmediata y segura", image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783343162/ChatGPT_Image_6_jul_2026_08_00_57_ltubiy_wtzklh.png", tint: "#DFF3F1" },
                            { id: "efectivo" as PaymentMethod, desc: "Paga al recibir tu pedido", image: "https://res.cloudinary.com/dhuggiq9q/image/upload/v1783343794/ChatGPT_Image_6_jul_2026_08_16_26_w9fla2.png", tint: "#E4F5D8" },
                          ].map((method) => {
                            const selected = paymentMethod === method.id;
                            return (
                              <motion.button
                                key={method.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPaymentMethod(method.id)}
                                className="w-full rounded-3xl p-3 flex items-center gap-4 bg-white border-2 transition-all"
                                style={{ borderColor: selected ? BRAND.orange : BRAND.peach, boxShadow: selected ? "0 10px 25px -10px rgba(255,122,0,0.35)" : undefined }}
                              >
                                <div className="h-14 w-14 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: method.tint }}>
                                  <img src={method.image} alt={PAYMENT_LABELS[method.id]} className="h-full w-full object-cover" />
                                </div>
                                <div className="text-left flex-1">
                                  <p className="font-bold">{PAYMENT_LABELS[method.id]}</p>
                                  <p className="text-xs mt-0.5" style={{ color: BRAND.brownSoft }}>{method.desc}</p>
                                </div>
                                <RoundIcon icon={ArrowRight} active={selected} />
                              </motion.button>
                            );
                          })}
                        </div>

                        <div className="rounded-[24px] p-6 mt-4 space-y-3 border-2" style={{ backgroundColor: BRAND.creamCard, borderColor: BRAND.peach }}>
                          <div className="flex justify-between text-lg font-bold" style={{ color: BRAND.orange }}>
                            <span>Total a Pagar</span>
                            <span>S/ {total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="relative mt-8 pb-4">
                          <div className="flex gap-3">
                            <Button variant="secondary" className="flex-[0.35] h-14 rounded-full" onClick={() => setView("delivery_mode")}>
                              <ArrowLeft size={18} /> Atrás
                            </Button>
                            <Button
                              className="flex-[0.65] h-14 text-lg font-bold rounded-full text-white shadow-lg transition-transform hover:scale-[1.02]"
                              style={{ background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.orangeSoft})` }}
                              onClick={() => setShowGateway(true)}
                            >
                              Continuar
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* --- PANTALLA B: PASARELA SIMULADA --- */
                      <motion.div key="gateway-simulation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="text-center mt-5 px-6 mb-6">
                          <h2 className="text-2xl font-bold mb-2">
                            {paymentMethod === "tarjeta" && "Ingresa tus datos"}
                            {(paymentMethod === "yape" || paymentMethod === "plin") && "Escanea para pagar"}
                            {paymentMethod === "efectivo" && "Pago contra entrega"}
                          </h2>
                          <p className="text-sm font-semibold" style={{ color: BRAND.orange }}>
                            Total: S/ {total.toFixed(2)}
                          </p>
                        </div>

                        {/* SIMULACIÓN: TARJETA */}
                        {paymentMethod === "tarjeta" && (
                          <div className="space-y-4 px-2">
                            <div className="rounded-2xl p-4 border-2" style={{ borderColor: BRAND.peach, backgroundColor: BRAND.creamCard }}>
                              <input type="text" placeholder="Número de tarjeta (Ej. 4500 1234...)" className="w-full bg-transparent outline-none font-mono tracking-widest text-sm mb-4 border-b pb-2" style={{ borderColor: BRAND.peach }} />
                              <div className="flex gap-4">
                                <input type="text" placeholder="MM/AA" className="w-1/2 bg-transparent outline-none font-mono text-sm" />
                                <input type="text" placeholder="CVV" className="w-1/2 bg-transparent outline-none font-mono text-sm border-l pl-4" style={{ borderColor: BRAND.peach }} />
                              </div>
                            </div>
                            <input type="text" placeholder="Nombre del titular" className="w-full rounded-2xl border-2 px-4 py-3 font-medium text-sm focus:outline-none" style={{ borderColor: BRAND.peach, backgroundColor: BRAND.creamCard }} />
                          </div>
                        )}

                        {/* SIMULACIÓN: YAPE / PLIN */}
                        {(paymentMethod === "yape" || paymentMethod === "plin") && (
                          <div className="flex flex-col items-center justify-center p-6 rounded-3xl border-2" style={{ borderColor: BRAND.peach, backgroundColor: BRAND.creamCard }}>
                            <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SimulacionPago" alt="Código QR de Pago" className="opacity-80" />
                            </div>
                            <p className="mt-4 font-bold text-sm" style={{ color: BRAND.brown }}>1. Abre tu App de {paymentMethod === "yape" ? "Yape" : "Plin"}</p>
                            <p className="text-xs text-center mt-1" style={{ color: BRAND.brownSoft }}>2. Escanea este código o transfiere al número <br/><span className="font-bold text-black">932563713</span></p>
                          </div>
                        )}

                        {/* SIMULACIÓN: EFECTIVO */}
                        {paymentMethod === "efectivo" && (
                          <div className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 text-center" style={{ borderColor: BRAND.peach, backgroundColor: BRAND.creamCard }}>
                            <Receipt size={48} style={{ color: BRAND.orange }} className="mb-4" />
                            <p className="font-bold text-sm">Tendremos tu vuelto listo.</p>
                            <p className="text-xs mt-2" style={{ color: BRAND.brownSoft }}>Por favor, ten billetes de baja denominación si es posible para facilitar el cambio.</p>
                          </div>
                        )}

                        {/* BOTONES DE LA PASARELA */}
                        <div className="relative mt-8 pb-4">
                          <div className="flex gap-3">
                            <Button variant="secondary" className="flex-[0.35] h-14 rounded-full text-xs px-1" onClick={() => setShowGateway(false)}>
                              Cambiar método
                            </Button>
                            <Button
                              className="flex-[0.65] h-14 text-[15px] font-bold rounded-full text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                              style={{ background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.greenSoft})` }}
                              onClick={handleConfirmPayment}
                            >
                              {paymentMethod === "tarjeta" && "Pagar S/ " + total.toFixed(2)}
                              {(paymentMethod === "yape" || paymentMethod === "plin") && "Ya pagué"}
                              {paymentMethod === "efectivo" && "Confirmar pedido"}
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-2xl p-3 flex items-center justify-center gap-2 text-[10px] font-semibold mt-2" style={{ color: BRAND.brownSoft }}>
                          <ShieldCheck size={14} style={{ color: BRAND.green }} /> Transacción cifrada y segura
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            )}

            {/* ============================================================ */}
            {/* STEP 5 · Resultado — MAPA ANIMADO Y DETALLE DE COMPRA        */}
            {/* ============================================================ */}
            {view === "tracking" && (
              <motion.section key="tracking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pb-8">
                <SheetHeader />

                <div className="px-6 space-y-4 bg-white p-1 rounded-t-4xl" style={{ boxShadow: SHEET_SHADOW }}>
                  <StepIndicator />
                  <div className="text-center mt-5 px-6 mb-2">
                    <h2 className="text-3xl font-bold mb-2">
                      {deliveryMode === "delivery" && "Sigue tu pedido"}
                      {deliveryMode === "pickup" && "Tu ticket de recojo"}
                      {deliveryMode === "dine_in" && "¡Pedido confirmado!"}
                    </h2>
                  </div>

                  <div className="rounded-3xl p-4 flex items-center justify-between border-2 bg-white" style={{ borderColor: BRAND.peach }}>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: BRAND.peach, color: BRAND.orange }}>
                        <UtensilsCrossed size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Pedido #{orderNumber}</p>
                        {deliveryMode === "delivery" && <p className="text-xs" style={{ color: BRAND.brownSoft }}>Entrega estimada: <span className="font-bold" style={{ color: BRAND.green }}>25 min</span></p>}
                        {deliveryMode === "pickup" && <p className="text-xs" style={{ color: BRAND.brownSoft }}>Recojo estimado: <span className="font-bold" style={{ color: BRAND.green }}>10 min</span></p>}
                        {deliveryMode === "dine_in" && <p className="text-xs" style={{ color: BRAND.brownSoft }}>{selectedBranch.name}</p>}
                      </div>
                    </div>
                  </div>

                  {/* MAPA ANIMADO CON FONDO REAL Y TRAZADO */}
                  {deliveryMode === "delivery" && (
                    <>
                      <div 
                        className="rounded-3xl border-2 p-6 relative overflow-hidden min-h-[220px]" 
                        style={{ 
                          borderColor: BRAND.peach,
                          backgroundImage: "url('https://snazzy-maps-cdn.azureedge.net/assets/74-micro.png?v=20170626083204')", 
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }}
                      >
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                          <span className="text-xs font-bold bg-white px-3 py-1 rounded-full shadow-sm">{selectedBranch.name}</span>
                          <span className="text-xs font-bold bg-white px-3 py-1 rounded-full shadow-sm">Tu ubicación</span>
                        </div>
                        
                        <div className="relative w-full h-16 flex items-center z-10">
                           <div className="absolute w-full h-1.5 bg-white shadow-inner rounded-full overflow-hidden">
                              <motion.div
                                className="h-full"
                                style={{ backgroundColor: BRAND.orange }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${getProgressPercentage(trackingStep)}%` }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                              />
                           </div>
                           
                           <Store className="absolute left-0 bg-white p-1 rounded-full shadow border-2" size={32} style={{ color: BRAND.brown, borderColor: BRAND.peach }} />
                           <HomeIcon className="absolute right-0 bg-white p-1 rounded-full shadow border-2" size={32} style={{ color: BRAND.brown, borderColor: BRAND.peach }} />
                           
                           <motion.div
                              className="absolute flex items-center justify-center bg-white rounded-full shadow-lg p-2 border-2"
                              initial={{ left: "0%", x: "-50%" }}
                              animate={{ left: `${getProgressPercentage(trackingStep)}%`, x: "-50%" }}
                              transition={{ duration: 1, ease: "easeInOut" }}
                              style={{ color: BRAND.orange, borderColor: BRAND.peach }}
                           >
                              <Bike size={24} />
                           </motion.div>
                        </div>
                      </div>

                      <div className="rounded-[24px] border-2 bg-white p-5 space-y-1" style={{ borderColor: BRAND.peach }}>
                        {stepsForMode.map((step, idx) => {
                          const activeIdx = stepsForMode.indexOf(trackingStep);
                          const isCompleted = idx < activeIdx;
                          const isCurrent = idx === activeIdx;
                          const Icon = trackingIcons[step];
                          return (
                            <div key={step} className="flex items-start gap-4 py-2">
                              <div className="flex flex-col items-center">
                                <div
                                  className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor: isCompleted ? "#E8F7D0" : isCurrent ? BRAND.orange : BRAND.peach,
                                    color: isCompleted ? "#5A8A00" : isCurrent ? "white" : BRAND.brownSoft,
                                  }}
                                >
                                  <Icon size={16} />
                                </div>
                                {idx < stepsForMode.length - 1 && (
                                  <div className="w-0.5 h-6 mt-1" style={{ backgroundColor: isCompleted ? BRAND.green : BRAND.peach }} />
                                )}
                              </div>
                              <div className="flex-1 pt-1">
                                <p className="font-semibold text-sm" style={{ color: isCurrent || isCompleted ? BRAND.brown : BRAND.brownSoft }}>{trackingLabels[step]}</p>
                                <p className="text-xs" style={{ color: BRAND.brownSoft }}>{trackingDescriptions[step]}</p>
                              </div>
                              {isCompleted && <Check size={16} style={{ color: BRAND.green }} className="mt-2" />}
                              {isCurrent && <span className="h-2.5 w-2.5 rounded-full mt-3" style={{ backgroundColor: BRAND.orange }} />}
                            </div>
                          );
                        })}
                      </div>

                      <div className="rounded-3xl border-2 bg-white p-4 flex items-center gap-4" style={{ borderColor: BRAND.peach }}>
                        <div
                          className="h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0 text-white overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeSoft})` }}
                        >
                          <img src="https://res.cloudinary.com/dhuggiq9q/image/upload/v1783363984/Dise%C3%B1o_sin_t%C3%ADtulo_12_mkzbbf.png" className="h-full w-full object-cover" alt="Carlos Repartidor" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">Repartidor: Carlos</p>
                          <p className="text-xs" style={{ color: BRAND.brownSoft }}>Moto delivery</p>
                        </div>
                        {/* Botones de Funciones Telefónicas */}
                        <button onClick={handleCallRider} className="h-10 w-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform" style={{ backgroundColor: "#E8F7D0" }}>
                           <Phone size={16} style={{ color: "#5A8A00" }} />
                        </button>
                        <button onClick={handleWhatsAppRider} className="h-10 w-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform" style={{ backgroundColor: BRAND.peach }}>
                           <MessageCircle size={16} style={{ color: BRAND.orange }} />
                        </button>
                      </div>
                    </>
                  )}

                  {deliveryMode === "pickup" && (
                     <>
                     <div className="rounded-[24px] p-6 text-center bg-white relative" style={{ border: `2px dashed ${BRAND.orange}` }}>
                       <Ticket size={28} className="mx-auto mb-3" style={{ color: BRAND.orange }} />
                       <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.brownSoft }}>Código de recojo</p>
                       <p className="text-4xl font-extrabold mt-1 tracking-wide" style={{ color: BRAND.orange }}>{pickupCode}</p>
                     </div>
                     </>
                  )}

                  {deliveryMode === "dine_in" && (
                    <div className="rounded-[24px] border-2 bg-white p-6 font-mono" style={{ borderColor: BRAND.peach }}>
                      <div className="text-center mb-4">
                        <Receipt size={26} className="mx-auto mb-2" style={{ color: BRAND.orange }} />
                        <p className="font-bold text-sm">LA TÍA TULA · BOLETA</p>
                      </div>
                      <div className="border-t border-dashed pt-3 space-y-1.5 text-center" style={{ borderColor: BRAND.peach }}>
                         <p className="font-bold text-xs">Pago Exitoso. Muestra este código en mesa.</p>
                      </div>
                    </div>
                  )}

                  {/* NUEVA SECCIÓN: IMAGEN Y DETALLE DEL PEDIDO AL FINAL DE LA COMPRA */}
                  <div className="rounded-3xl border-2 bg-white p-4" style={{ borderColor: BRAND.peach }}>
                    <p className="font-bold text-sm mb-4" style={{ color: BRAND.orange }}>RESUMEN DE TU COMPRA</p>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                           <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 border" style={{ backgroundColor: BRAND.cream, borderColor: BRAND.peach }}>
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                           </div>
                           <div className="flex-1">
                              <p className="font-bold text-sm leading-tight" style={{ color: BRAND.brown }}>{cart[item.id]}x {item.name}</p>
                              <p className="text-xs" style={{ color: BRAND.brownSoft }}>S/ {(item.price * (cart[item.id] ?? 0)).toFixed(2)}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t-2 border-dashed flex justify-between items-center" style={{ borderColor: BRAND.peach }}>
                        <span className="font-bold text-sm">Total pagado</span>
                        <span className="font-extrabold text-lg" style={{ color: BRAND.orange }}>S/ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="relative mt-8 pb-4">
                    <Button variant="secondary" className="w-full h-14 rounded-full" onClick={startNewOrder}>
                      Hacer nuevo pedido
                    </Button>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
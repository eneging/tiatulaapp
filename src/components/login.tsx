"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "Teléfono inválido"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginProps {
  onLoginSuccess: (data: LoginFormData) => void;
}

const BRAND = {
  orange: "#FF7A00",
  orangeSoft: "#FF9A30",
  green: "#8BCB00",
  cream: "#F9F6F1",
  peach: "#FFE5CC",
  brown: "#3B1D0F",
  brownSoft: "#8B7355",
};

export default function Login({ onLoginSuccess }: LoginProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    onLoginSuccess(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"  style={{ 
        backgroundColor: BRAND.cream,
        /* 1. ASEGÚRATE DE MANTENER url('') ALREDEDOR DE TU LINK */
        backgroundImage: "url('https://res.cloudinary.com/dhuggiq9q/image/upload/v1783363000/Gemini_Generated_Image_upx6lmupx6lmupx6_zti4fc.png')", 
        backgroundRepeat: "repeat",
        backgroundSize: "500px", /* Hazlo más chico o grande aquí */
        backgroundAttachment: "fixed", /* Evita que el fondo se corte al hacer scroll */
        backgroundBlendMode: "multiply", /* TRUCO: Elimina el fondo blanco de tu imagen */
        color: BRAND.brown 
      }}
    
    
    
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-4">
          <div className="flex justify-center">
            <motion.img
              src="https://res.cloudinary.com/dhuggiq9q/image/upload/v1783316731/Dise%C3%B1o_sin_t%C3%ADtulo_3_tdzqiz.png"
              alt="La Tía Tula"
              className="h-44 w-44 sm:h-52 sm:w-52 object-contain drop-shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: BRAND.brown }}>
            La Tía Tula
          </h1>
          <p style={{ color: BRAND.brownSoft }}>Pollos &amp; Parrillas</p>
        </div>

        <div
          className="rounded-[32px] border-2 bg-white p-8 shadow-[0_20px_80px_-30px_rgba(59,29,15,0.2)]"
          style={{ borderColor: BRAND.peach }}
        >
         

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BRAND.brown }}>
                Nombre completo
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="Juan Pérez"
                className="w-full rounded-[16px] border-2 px-4 py-3 placeholder-[#8B7355] focus:outline-none focus:ring-2"
                style={{ borderColor: BRAND.peach, backgroundColor: BRAND.cream, color: BRAND.brown, ["--tw-ring-color" as any]: BRAND.orange }}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BRAND.brown }}>
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="juan@ejemplo.com"
                className="w-full rounded-[16px] border-2 px-4 py-3 placeholder-[#8B7355] focus:outline-none focus:ring-2"
                style={{ borderColor: BRAND.peach, backgroundColor: BRAND.cream, color: BRAND.brown, ["--tw-ring-color" as any]: BRAND.orange }}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BRAND.brown }}>
                Teléfono
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+51 900 123 456"
                className="w-full rounded-[16px] border-2 px-4 py-3 placeholder-[#8B7355] focus:outline-none focus:ring-2"
                style={{ borderColor: BRAND.peach, backgroundColor: BRAND.cream, color: BRAND.brown, ["--tw-ring-color" as any]: BRAND.orange }}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-12 mt-6 rounded-full text-white font-bold shadow-lg"
              style={{ background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.orangeSoft})` }}
            >
              Continuar como cliente
            </Button>

            <button
              type="button"
              onClick={() => onLoginSuccess({ name: "Invitado", email: "guest@tula.local", phone: "999999999" })}
              className="w-full h-12 rounded-full border-2 font-semibold transition hover:bg-orange-50"
              style={{ backgroundColor: BRAND.cream, borderColor: BRAND.peach, color: BRAND.brown }}
            >
              Continuar como invitado
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: BRAND.brownSoft }}>
          Tu información está protegida y será utilizada solo para tu pedido.
        </p>
      </motion.div>
    </div>
  );
}
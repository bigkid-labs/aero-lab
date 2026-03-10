import { z } from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Generic fetcher ───────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? "Unknown error");
  }

  const json = await res.json();
  return schema.parse(json); // Runtime validation via zod
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const HealthSchema = z.object({
  status: z.string(),
  service: z.string(),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  price_vnd: z.number().nullable(),
  model_key: z.string().nullable(),
  thumbnail_key: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ProductGeometrySchema = z.object({
  spec_key: z.string(),
  spec_value: z.number(),
  unit: z.string(),
});

export const ProductDetailSchema = ProductSchema.extend({
  geometries: z.array(ProductGeometrySchema),
});

export const FitRequestSchema = z.object({
  full_name:        z.string(),
  email:            z.string().optional(),
  torso_mm:         z.number().positive(),
  arm_mm:           z.number().positive(),
  inseam_mm:        z.number().positive(),
  flexibility:      z.number().int().min(1).max(5),
  aggression_level: z.number().int().min(1).max(5),
  product_slug:     z.string(),
});

export const FitAdjustmentSchema = z.object({
  spec: z.string(),
  current_mm: z.number(),
  ideal_mm: z.number(),
  delta_mm: z.number(),
  note: z.string(),
});

export const FitAnalysisSchema = z.object({
  fit_score:       z.number(),
  verdict:         z.string(),
  recommendation:  z.string(),
  adjustments:     z.array(FitAdjustmentSchema),
  risk_assessment: z.enum(["Low", "Moderate", "High"]),
  specialist_cta:  z.boolean(),
});

export const ConsultationRequestSchema = z.object({
  full_name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  product_slug: z.string().optional(),
  message: z.string().optional(),
});

export const ConsultationCreatedSchema = z.object({
  id: z.string(),
  message: z.string(),
});

export type Health = z.infer<typeof HealthSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductGeometry = z.infer<typeof ProductGeometrySchema>;
export type ProductDetail = z.infer<typeof ProductDetailSchema>;
export type FitRequest = z.infer<typeof FitRequestSchema>;
export type FitAdjustment = z.infer<typeof FitAdjustmentSchema>;
export type FitAnalysis = z.infer<typeof FitAnalysisSchema>;
export type ConsultationRequest = z.infer<typeof ConsultationRequestSchema>;

// ─── API Client ───────────────────────────────────────────────────────────────

export const api = {
  health: () =>
    apiFetch("/health", HealthSchema),

  products: {
    list: (category?: string) =>
      apiFetch(
        `/api/v1/products${category ? `?category=${encodeURIComponent(category)}` : ""}`,
        z.array(ProductSchema),
      ),
    categories: () =>
      apiFetch("/api/v1/products/categories", z.array(z.string())),
    get: (slug: string) =>
      apiFetch(`/api/v1/products/${slug}`, ProductDetailSchema),
  },

  fitting: {
    analyze: (body: FitRequest) =>
      apiFetch("/api/v1/fitting/analyze", FitAnalysisSchema, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  consultations: {
    create: (body: ConsultationRequest) =>
      apiFetch("/api/v1/consultations", ConsultationCreatedSchema, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
} as const;

export { ApiError };

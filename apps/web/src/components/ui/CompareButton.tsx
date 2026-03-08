"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "bk_compare_slug";

export function CompareButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setPending(stored);
    setIsSelected(stored === slug);
  }, [slug]);

  function handleClick() {
    if (isSelected) {
      // Deselect
      localStorage.removeItem(STORAGE_KEY);
      setPending(null);
      setIsSelected(false);
      return;
    }

    if (pending && pending !== slug) {
      // Second product selected — go to compare page
      router.push(`/products/compare?a=${pending}&b=${slug}`);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // First product selected
    localStorage.setItem(STORAGE_KEY, slug);
    setPending(slug);
    setIsSelected(true);
  }

  const label = isSelected
    ? "✓ Selected — pick another to compare"
    : pending && pending !== slug
    ? `Compare with ${name.slice(0, 18)}...`
    : "+ Compare";

  return (
    <button
      onClick={handleClick}
      title={label}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.58rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        padding: "0.35rem 0.75rem",
        backgroundColor: isSelected ? "var(--aero-accent-glow)" : "transparent",
        border: `1px solid ${isSelected ? "var(--aero-accent)" : "var(--aero-border)"}`,
        color: isSelected ? "var(--aero-accent)" : "var(--aero-grey-dim)",
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "200px",
      }}
    >
      {pending && pending !== slug ? `Compare →` : isSelected ? "✓ SELECTED" : "+ COMPARE"}
    </button>
  );
}

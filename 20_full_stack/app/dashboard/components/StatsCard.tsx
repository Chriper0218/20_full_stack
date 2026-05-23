"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color: string;
  borderColor: string;
  trend?: string;
}

export default function StatsCard({ icon, label, value, color, borderColor, trend }: StatsCardProps) {
  return (
    <div
      style={{
        background: `${color}10`,
        border: `1px solid ${borderColor}30`,
        borderRadius: "1rem",
        padding: "1.5rem",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = `${borderColor}60`;
        e.currentTarget.style.boxShadow = `0 8px 24px ${borderColor}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = `${borderColor}30`;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: "0.75rem",
        background: `${borderColor}20`,
        border: `1px solid ${borderColor}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: color, marginBottom: "1rem",
      }}>
        {icon}
      </div>

      {/* Value */}
      <div style={{ fontSize: "2rem", fontWeight: 800, color, lineHeight: 1, marginBottom: "0.3rem" }}>
        {value}
      </div>

      {/* Label */}
      <div style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 500 }}>
        {label}
      </div>

      {/* Trend */}
      {trend && (
        <div style={{ fontSize: "0.75rem", color: "#34d399", marginTop: "0.5rem", fontWeight: 600 }}>
          {trend}
        </div>
      )}
    </div>
  );
}

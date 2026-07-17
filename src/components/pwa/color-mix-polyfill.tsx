'use client'

import { useEffect } from 'react'

/**
 * Polyfill untuk color-mix() CSS function di browser lama (Chrome < 111 / Android 8.1).
 *
 * Tailwind v4 generate `color-mix(in oklab, var(--color-X) Y%, transparent)` untuk
 * opacity modifier (bg-primary/50, dll). Browser lama tidak support color-mix()
 * → property invalid → background/border/text jadi transparan → app broken/blank.
 *
 * Polyfill scan semua stylesheet same-origin, replace color-mix(var()) dengan
 * rgb(var() / alpha) yang support di Chrome 62+.
 */
export function ColorMixPolyfill() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Cek apakah browser support color-mix
    let supportsColorMix = false
    try {
      supportsColorMix = CSS.supports('color', 'color-mix(in srgb, red, red)')
    } catch {
      supportsColorMix = false
    }
    if (supportsColorMix) return

    // Regex: color-mix(in <space>, var(--color-X) <alpha>%, transparent)
    const COLOR_MIX_RE =
      /color-mix\(\s*in\s+[\w-]+\s*,\s*var\((--color-[\w-]+)\)\s+([\d.]+)%\s*,\s*transparent\s*\)/g

    const COLOR_PROPS = [
      'background-color',
      'background',
      'border-color',
      'border',
      'color',
      'fill',
      'stroke',
      'outline-color',
      'box-shadow',
      'text-decoration-color',
      'caret-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
    ]

    const processRule = (rule: CSSRule) => {
      const styleRule = rule as CSSStyleRule
      if (!styleRule.style) return

      for (const prop of COLOR_PROPS) {
        const value = styleRule.style.getPropertyValue(prop)
        if (value && value.indexOf('color-mix') !== -1) {
          const newValue = value.replace(
            COLOR_MIX_RE,
            (_m, varName: string, alpha: string) => {
              const a = parseFloat(alpha) / 100
              return `rgb(var(${varName}) / ${a})`
            }
          )
          if (newValue !== value) {
            styleRule.style.setProperty(prop, newValue)
          }
        }
      }
    }

    const walkRules = (rules: CSSRuleList) => {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i]
        processRule(rule)
        // Recurse ke nested rules (media query, supports, dll)
        const nested = (rule as CSSGroupingRule).cssRules
        if (nested) {
          walkRules(nested)
        }
      }
    }

    const processAllSheets = () => {
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i]
        try {
          walkRules(sheet.cssRules)
        } catch {
          // Cross-origin stylesheet (cssRules tidak accessible), skip
        }
      }
    }

    // Run setelah DOM ready + CSS load
    processAllSheets()

    // Re-run jika ada stylesheet baru ditambahkan (hot reload, dynamic import)
    const observer = new MutationObserver(() => {
      processAllSheets()
    })
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}

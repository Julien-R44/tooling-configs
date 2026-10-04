// Adapted from antfu/eslint-plugin-slop (MIT). See LICENSE.
import { defineRule } from '@oxlint/plugins'

interface Options {
  allow?: string[]
  extraWords?: string[]
  ignoreJSDoc?: boolean
  words?: string[]
}

export const defaultJargonWords = [
  'utilize',
  'utilise',
  'leverage',
  'delve',
  'facilitate',
  'streamline',
  'seamless',
  'seamlessly',
  'robust',
  'comprehensive',
  'meticulous',
  'meticulously',
  'crucial',
  'pivotal',
  'myriad',
  'plethora',
  'paramount',
  'holistic',
  'multifaceted',
  'nuanced',
  'synergy',
  'bolster',
  'encompass',
  'endeavor',
  'endeavour',
  'aforementioned',
  'commence',
] as const

const swaps = new Map([
  ['utilize', 'use'],
  ['utilise', 'use'],
  ['leverage', 'use'],
  ['facilitate', 'help'],
  ['streamline', 'simplify'],
  ['comprehensive', 'complete'],
  ['crucial', 'important'],
  ['paramount', 'important'],
  ['encompass', 'include'],
  ['commence', 'start'],
])

function escape(word: string) {
  return word.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function toPattern(word: string) {
  const parts = [`${escape(word)}(?:s|es|d|ed|ing|ly|ally)?`]
  if (word.endsWith('e')) {
    parts.push(`${escape(word.slice(0, -1))}(?:ing|ed|es)`)
  }
  if (word.endsWith('y')) {
    parts.push(`${escape(word.slice(0, -1))}ies`)
  }
  return parts.join('|')
}

function isQuoted(text: string, index: number) {
  let backticks = 0
  let doubleQuotes = 0
  for (let i = 0; i < index; i++) {
    if (text[i] === '`') {
      backticks++
    } else if (text[i] === '"') {
      doubleQuotes++
    }
  }
  return backticks % 2 === 1 || doubleQuotes % 2 === 1
}

export const noJargonRule = defineRule({
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    docs: {
      description: 'Disallow inflated vocabulary in comments.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopno-jargon',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allow: { type: 'array', items: { type: 'string', minLength: 1 } },
          extraWords: { type: 'array', items: { type: 'string', minLength: 1 } },
          ignoreJSDoc: { type: 'boolean' },
          words: { type: 'array', items: { type: 'string', minLength: 1 } },
        },
      },
    ],
    messages: {
      jargon: 'Avoid "{{word}}" in comments. Prefer plainer wording a person would type.',
      replace: 'Replace "{{word}}" with "{{replacement}}".',
    },
  },
  createOnce(context) {
    return {
      Program() {
        const options = (context.options[0] ?? {}) as Options
        const allow = new Set((options.allow ?? []).map(word => word.toLowerCase()))
        const words = (options.words ?? [...defaultJargonWords])
          .concat(options.extraWords ?? [])
          .filter(word => !allow.has(word.toLowerCase()))
        if (words.length === 0) {
          return
        }

        const matcher = new RegExp(`\\b(?:${words.map(toPattern).join('|')})\\b`, 'giu')
        const source = context.sourceCode
        for (const comment of source.getAllComments()) {
          const raw = source.text.slice(comment.range[0], comment.range[1])
          if (options.ignoreJSDoc && comment.type === 'Block' && raw.startsWith('/**')) {
            continue
          }

          matcher.lastIndex = 0
          for (let match = matcher.exec(raw); match; match = matcher.exec(raw)) {
            if (isQuoted(raw, match.index)) {
              continue
            }

            const start = comment.range[0] + match.index
            const end = start + match[0].length
            const replacement = swaps.get(match[0].toLowerCase())
            context.report({
              loc: { start: source.getLocFromIndex(start), end: source.getLocFromIndex(end) },
              messageId: 'jargon',
              data: { word: match[0] },
              suggest: replacement
                ? [
                    {
                      messageId: 'replace',
                      data: { word: match[0], replacement },
                      fix: fixer => fixer.replaceTextRange([start, end], replacement),
                    },
                  ]
                : undefined,
            })
          }
        }
      },
    }
  },
})

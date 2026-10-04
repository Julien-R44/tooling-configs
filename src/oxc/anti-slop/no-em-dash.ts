// Adapted from antfu/eslint-plugin-slop (MIT). See LICENSE.
import { defineRule } from '@oxlint/plugins'

const SENTENCE_TERMINATORS = new Set(['.', '!', '?'])

function getSentenceRange(text: string, index: number) {
  let start = index
  while (start > 0) {
    const char = text[start - 1]
    if (char === '\n' || SENTENCE_TERMINATORS.has(char!)) {
      break
    }
    start--
  }

  let end = index + 1
  while (end < text.length) {
    const char = text[end]
    if (char === '\n') {
      break
    }
    end++
    if (SENTENCE_TERMINATORS.has(char!)) {
      break
    }
  }

  while (start < index && /\s/u.test(text[start]!)) {
    start++
  }
  while (end > index + 1 && /\s/u.test(text[end - 1]!)) {
    end--
  }
  return { start, end }
}

export const noEmDashRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow literal em dashes in source text.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopno-em-dash',
    },
    schema: [],
    messages: {
      avoid: 'Avoid em dashes in prose. Rephrase this sentence with shorter, more natural wording.',
    },
  },
  createOnce(context) {
    return {
      Program() {
        const source = context.sourceCode
        const text = source.text
        const reported = new Set<number>()
        for (
          let index = text.indexOf('\u2014');
          index !== -1;
          index = text.indexOf('\u2014', index + 1)
        ) {
          const sentence = getSentenceRange(text, index)
          if (reported.has(sentence.start)) {
            continue
          }
          reported.add(sentence.start)
          context.report({
            loc: {
              start: source.getLocFromIndex(sentence.start),
              end: source.getLocFromIndex(sentence.end),
            },
            messageId: 'avoid',
          })
        }
      },
    }
  },
})

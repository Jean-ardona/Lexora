import { sql } from 'drizzle-orm';
import { db } from './client';
import { drops } from './schema';

export const seedDatabase = async () => {
    try {
        // Check if the table is empty
        const result = await db.select({ count: sql<number>`count(*)` }).from(drops);
        const count = result[0].count;

        if (count === 0) {
            console.log('Seeding initial drops...');
            await db.insert(drops).values([
                {
                    term: 'to give up',
                    type: 'phrasal_verb',
                    phonetic: 'tuː ɡɪv ʌp',
                    definition: 'To stop trying to do something; to quit.',
                    examples: [
                        'She gave up smoking after 10 years.',
                        "Don't give up — you're almost there!",
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'eager',
                    type: 'word',
                    phonetic: 'ˈiːɡər',
                    definition: 'Very enthusiastic and excited about something.',
                    examples: [
                        'He was eager to start his new job.',
                        'The kids were eager to open their presents.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'to brush off',
                    type: 'phrasal_verb',
                    phonetic: 'tuː brʌʃ ɔːf',
                    definition: 'To dismiss or ignore something or someone.',
                    examples: [
                        'She brushed off the criticism and kept going.',
                        "He brushed off my question like it didn't matter.",
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'break the ice',
                    type: 'expression',
                    phonetic: 'breɪk ðə aɪs',
                    definition: 'To say or do something to reduce tension and make people feel comfortable.',
                    examples: [
                        'He told a joke to break the ice at the meeting.',
                        'A simple question can break the ice at a party.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'straightforward',
                    type: 'word',
                    phonetic: 'ˌstreɪtˈfɔːrwərd',
                    definition: 'Easy to understand; clear and honest.',
                    examples: [
                        'The instructions were very straightforward.',
                        "Just be straightforward with me — what's the problem?",
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'to figure out',
                    type: 'phrasal_verb',
                    phonetic: 'tuː ˈfɪɡər aʊt',
                    definition: 'To understand or find a solution to something.',
                    examples: [
                        "I can't figure out how to use this app.",
                        'She finally figured out the answer.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'hit the nail on the head',
                    type: 'expression',
                    phonetic: 'hɪt ðə neɪl ɒn ðə hɛd',
                    definition: 'To describe or identify something exactly correctly.',
                    examples: [
                        "You hit the nail on the head — that's exactly the issue.",
                        'His analysis really hit the nail on the head.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'overwhelming',
                    type: 'word',
                    phonetic: 'ˌoʊvərˈwɛlmɪŋ',
                    definition: 'Very intense or difficult to deal with; too much to handle.',
                    examples: [
                        'The amount of work was overwhelming.',
                        "She felt overwhelmed by everyone's support.",
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'to look into',
                    type: 'phrasal_verb',
                    phonetic: 'tuː lʊk ˈɪntuː',
                    definition: 'To investigate or examine something carefully.',
                    examples: [
                        "I'll look into the problem and get back to you.",
                        'The manager looked into the complaint.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'under the weather',
                    type: 'expression',
                    phonetic: 'ˌʌndər ðə ˈwɛðər',
                    definition: 'Feeling slightly ill or unwell.',
                    examples: [
                        "I'm feeling a bit under the weather today.",
                        'She stayed home because she was under the weather.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'consistent',
                    type: 'word',
                    phonetic: 'kənˈsɪstənt',
                    definition: 'Always behaving or happening in the same way; reliable over time.',
                    examples: [
                        'You need to be consistent with your practice.',
                        'Her performance has been consistent all season.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'to pull off',
                    type: 'phrasal_verb',
                    phonetic: 'tuː pʊl ɔːf',
                    definition: 'To succeed in doing something difficult or unexpected.',
                    examples: [
                        'He pulled off an amazing deal.',
                        "I can't believe she pulled that off!",
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'bite off more than you can chew',
                    type: 'expression',
                    phonetic: 'baɪt ɔːf mɔːr ðæn ju kæn tʃuː',
                    definition: 'To take on more responsibility than you can handle.',
                    examples: [
                        'He bit off more than he could chew with three projects at once.',
                        "Don't bite off more than you can chew when starting a new business.",
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'subtle',
                    type: 'word',
                    phonetic: 'ˈsʌtəl',
                    definition: 'Not obvious; hard to notice or understand at first.',
                    examples: [
                        "There's a subtle difference between the two versions.",
                        'She gave him a subtle hint that it was time to leave.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'to bring up',
                    type: 'phrasal_verb',
                    phonetic: 'tuː brɪŋ ʌp',
                    definition: 'To mention a topic in a conversation.',
                    examples: [
                        'She brought up an interesting point in the meeting.',
                        'Why did you bring that up now?',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'on the same page',
                    type: 'expression',
                    phonetic: 'ɒn ðə seɪm peɪdʒ',
                    definition: 'In agreement; sharing the same understanding of a situation.',
                    examples: [
                        "Let's make sure we're on the same page before we start.",
                        'After the meeting, everyone was on the same page.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'resilient',
                    type: 'word',
                    phonetic: 'rɪˈzɪliənt',
                    definition: 'Able to recover quickly from difficult situations.',
                    examples: [
                        'Children are surprisingly resilient.',
                        'You have to be resilient to succeed in business.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'to sort out',
                    type: 'phrasal_verb',
                    phonetic: 'tuː sɔːrt aʊt',
                    definition: 'To resolve a problem or organize something.',
                    examples: [
                        'We need to sort out this misunderstanding.',
                        'Can you sort out the files on your desk?',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'the ball is in your court',
                    type: 'expression',
                    phonetic: 'ðə bɔːl ɪz ɪn jɔːr kɔːrt',
                    definition: "It's your turn to take action or make a decision.",
                    examples: [
                        "I've done my part — the ball is in your court now.",
                        'She gave him her number, so the ball was in his court.',
                    ],
                    isLearned: false,
                    dropDate: null,
                },
                {
                    term: 'to keep up with',
                    type: 'phrasal_verb',
                    phonetic: 'tuː kiːp ʌp wɪð',
                    definition: 'To stay at the same level or pace as someone or something.',
                    examples: [
                        "It's hard to keep up with all the new technology.",
                        "She runs fast — I can't keep up with her!",
                    ],
                    isLearned: false,
                    dropDate: null,
                }
            ]);
            console.log('Database seeded successfully!');
        } else {
            console.log('Database already has data. Skipping seed.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
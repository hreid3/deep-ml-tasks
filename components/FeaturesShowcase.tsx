'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const features = [
  {
    title: 'Text Embeddings API',
    description: 'Generate powerful text embeddings for advanced NLP tasks',
    status: 'current',
  },
  {
    title: 'Semantic Search',
    description: 'Implement intelligent search functionality in your applications',
    status: 'coming soon',
  },
  {
    title: 'Text Classification',
    description: 'Automatically categorize text with high accuracy',
    status: 'coming soon',
  },
  {
    title: 'Named Entity Recognition',
    description: 'Extract and classify named entities from text',
    status: 'coming soon',
  },
]

export default function FeaturesShowcase() {
  return (
    <section className="w-full py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-gradient">
        Feature Showcase
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <Card className="bg-purple-950/20 border-purple-900 hover:border-purple-800 transition-colors duration-300 h-full relative overflow-hidden group">
              <div className="absolute inset-0 bevel-border"></div>
              <div className="absolute inset-0 bevel-light opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-purple-300">{feature.title}</CardTitle>
                <CardDescription className="text-purple-400">{feature.description}</CardDescription>
                <div className="mt-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    feature.status === 'current' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'
                  }`}>
                    {feature.status}
                  </span>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}


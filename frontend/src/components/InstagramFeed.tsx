'use client'

import { InstagramPost } from '@/types'
import { Instagram, Heart } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface InstagramFeedProps {
  posts: InstagramPost[]
  handle?: string
}

export default function InstagramFeed({ posts, handle }: InstagramFeedProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Instagram className="h-6 w-6 text-pink-600" />
        <h3 className="text-lg font-semibold text-gray-900">Instagram</h3>
        {handle && (
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-pink-600 hover:text-pink-700"
          >
            @{handle}
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
          >
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Heart className="h-5 w-5 fill-current" />
                  <span className="font-semibold">{post.likes.toLocaleString()}</span>
                </div>
                <p className="text-sm line-clamp-3">{post.caption}</p>
                <p className="text-xs mt-2 opacity-75">
                  {formatDistanceToNow(new Date(post.timestamp), {
                    addSuffix: true,
                    locale: ja
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { toHTML } from '@portabletext/to-html'

// Note: Sanity project details are usually public.
// Initialize the client.
export const sanityClient = createClient({
    projectId: 'mwp5ydp0',
    dataset: 'production',
    apiVersion: '2024-02-28', // Use current date for latest API version
    useCdn: true, // `false` if you want to ensure fresh data
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source) {
    return builder.image(source)
}

export function portableTextToHtml(portableTextBlocks) {
    return toHTML(portableTextBlocks, {
        components: {
            types: {
                image: ({ value }) => `<img src="${urlFor(value).url()}" alt="${value.alt || ''}" class="blog-image" />`,
            }
        }
    })
}

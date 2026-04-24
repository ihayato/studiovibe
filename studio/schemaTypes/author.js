export default {
    name: 'author',
    title: 'Author',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'avatar',
            title: 'Avatar',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'role',
            title: 'Role',
            type: 'string',
        },
        {
            name: 'bio',
            title: 'Bio',
            type: 'text',
        },
    ],
    preview: {
        select: {
            title: 'name',
            media: 'avatar',
        },
    },
}

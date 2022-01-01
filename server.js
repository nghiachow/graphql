const express = require('express')
const cors = require('cors')
const { graphqlHTTP } = require("express-graphql");const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')


const app = express()
app.use(cors())
let authors = [
    {id: 1, name: 'J. K. Rowling'},
    {id: 2, name: 'J. R. R. Tolkien'},
    {id: 3, name: 'Bret Weeks'}
]

let books = [
    {id: 1, name:'Harry Porter and the Chamber of Secrets', authorId: 1},
    {id: 2, name:'Harry Porter and the Prisoner of Azkaban', authorId: 1},
    {id: 3, name:'Harry Porter and the Goblet of Fire', authorId: 1},
    {id: 4, name:'The fellowship of the Ring', authorId: 2},
    {id: 5, name:'The Two Towers', authorId: 2},
    {id: 6, name:'The Return of the King', authorId: 2},
    {id: 7, name:'The Way of Shadows', authorId: 3},
    {id: 8, name:'Beyond the Shadows', authorId: 3},
]

const BookType = new GraphQLObjectType({
    name:'Book',
    description:'This represent a book',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId:{type: GraphQLNonNull(GraphQLInt)},
        author:{
            type: AuthorType,
            resolve: (book) =>{
                return authors.find(authors => authors.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name:'Author',
    description:'This represent an author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (authors) => {
                return books.filter(book => book.authorId === authors.id)
            }
        }
    })
})
const RootQueryType = new GraphQLObjectType({
    name:'Query',
    description:'Root Query',
    fields: () =>({
        book: {
            type: BookType,
            description: 'Just a Book',
            args:{
                id: {type: GraphQLInt},
            },
            resolve: (parent,args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'Just an Author',
            args:{
                id: {type: GraphQLInt}
            },
            resolve: (parent,args) => authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: () => authors
        }
    })
})

const RootMutaionType = new GraphQLObjectType({
    name:'Mutation',
    description:'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description:'Add a book',
            args:{
                name:{type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent,args) => {
                const book = {id:books.length + 1, name: args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        },
        deleteBook: {
            type: GraphQLList(BookType),
            description:'Delete a book',
            args:{
                id:{type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent,args) => {
                const newBooks = books.filter(item => item.id !== args.id)
                books = [...newBooks]
                return books
            }
        },
        updateBook: {
            type: BookType,
            description:'Update a book',
            args:{
                id:{type: GraphQLNonNull(GraphQLInt)},
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId:{type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent,args) => {
                const newBook = books.find(book => book.id === args.id)
                newBook.name = args.name
                newBook.authorId = args.authorId
                return newBook
            }
        },
        addAuthor: {
            type: AuthorType,
            description:'Add an Author',
            args:{
                name:{type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent,args) => {
                const author = {id:authors.length + 1, name: args.name}
                authors.push(author)
                return author
            }
        },
        updateAuthor: {
            type: AuthorType,
            description:'Update an author',
            args:{
                id:{type: GraphQLNonNull(GraphQLInt)},
                name: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent,args) => {
                const newAuthor = authors.find(author => author.id === args.id)
                newAuthor.name = args.name
                return newAuthor
            }
        },
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutaionType
})

app.use('/graphql', graphqlHTTP({
    schema:schema,
    graphiql: true
}))
app.listen(3000, () => console.log("App is running!"))
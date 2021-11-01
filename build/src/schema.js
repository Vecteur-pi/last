"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.DateTime = void 0;
const nexus_1 = require("nexus");
const graphql_scalars_1 = require("graphql-scalars");
exports.DateTime = (0, nexus_1.asNexusMethod)(graphql_scalars_1.DateTimeResolver, 'date');
const Query = (0, nexus_1.objectType)({
    name: 'Query',
    definition(t) {
        t.nonNull.list.nonNull.field('allUsers', {
            type: 'User',
            resolve: (_parent, _args, context) => {
                return context.prisma.user.findMany();
            },
        });
        t.nullable.field('postById', {
            type: 'Post',
            args: {
                id: (0, nexus_1.intArg)(),
            },
            resolve: (_parent, args, context) => {
                return context.prisma.post.findUnique({
                    where: { id: args.id || undefined },
                });
            },
        });
        t.nonNull.list.nonNull.field('feed', {
            type: 'Post',
            args: {
                searchString: (0, nexus_1.stringArg)(),
                skip: (0, nexus_1.intArg)(),
                take: (0, nexus_1.intArg)(),
                orderBy: (0, nexus_1.arg)({
                    type: 'PostOrderByUpdatedAtInput',
                }),
            },
            resolve: (_parent, args, context) => {
                const or = args.searchString
                    ? {
                        OR: [
                            { title: { contains: args.searchString } },
                            { content: { contains: args.searchString } },
                        ],
                    }
                    : {};
                return context.prisma.post.findMany({
                    where: Object.assign({ published: true }, or),
                    take: args.take || undefined,
                    skip: args.skip || undefined,
                    orderBy: args.orderBy || undefined,
                });
            },
        });
        t.list.field('draftsByUser', {
            type: 'Post',
            args: {
                userUniqueInput: (0, nexus_1.nonNull)((0, nexus_1.arg)({
                    type: 'UserUniqueInput',
                })),
            },
            resolve: (_parent, args, context) => {
                return context.prisma.user
                    .findUnique({
                    where: {
                        id: args.userUniqueInput.id || undefined,
                        email: args.userUniqueInput.email || undefined,
                    },
                })
                    .posts({
                    where: {
                        published: false,
                    },
                });
            },
        });
    },
});
const Mutation = (0, nexus_1.objectType)({
    name: 'Mutation',
    definition(t) {
        t.nonNull.field('signupUser', {
            type: 'User',
            args: {
                data: (0, nexus_1.nonNull)((0, nexus_1.arg)({
                    type: 'UserCreateInput',
                })),
            },
            resolve: (_, args, context) => {
                var _a;
                const postData = (_a = args.data.posts) === null || _a === void 0 ? void 0 : _a.map((post) => {
                    return { title: post.title, content: post.content || undefined };
                });
                return context.prisma.user.create({
                    data: {
                        name: args.data.name,
                        email: args.data.email,
                        posts: {
                            create: postData,
                        },
                    },
                });
            },
        });
        t.field('createDraft', {
            type: 'Post',
            args: {
                data: (0, nexus_1.nonNull)((0, nexus_1.arg)({
                    type: 'PostCreateInput',
                })),
                authorEmail: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve: (_, args, context) => {
                return context.prisma.post.create({
                    data: {
                        title: args.data.title,
                        content: args.data.content,
                        author: {
                            connect: { email: args.authorEmail },
                        },
                    },
                });
            },
        });
        t.field('togglePublishPost', {
            type: 'Post',
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
            },
            resolve: (_, args, context) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const post = yield context.prisma.post.findUnique({
                        where: { id: args.id || undefined },
                        select: {
                            published: true,
                        },
                    });
                    return context.prisma.post.update({
                        where: { id: args.id || undefined },
                        data: { published: !(post === null || post === void 0 ? void 0 : post.published) },
                    });
                }
                catch (e) {
                    throw new Error(`Post with ID ${args.id} does not exist in the database.`);
                }
            }),
        });
        t.field('incrementPostViewCount', {
            type: 'Post',
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
            },
            resolve: (_, args, context) => {
                return context.prisma.post.update({
                    where: { id: args.id || undefined },
                    data: {
                        viewCount: {
                            increment: 1,
                        },
                    },
                });
            },
        });
        t.field('deletePost', {
            type: 'Post',
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
            },
            resolve: (_, args, context) => {
                return context.prisma.post.delete({
                    where: { id: args.id },
                });
            },
        });
    },
});
const User = (0, nexus_1.objectType)({
    name: 'User',
    definition(t) {
        t.nonNull.int('id');
        t.string('name');
        t.nonNull.string('email');
        t.nonNull.list.nonNull.field('posts', {
            type: 'Post',
            resolve: (parent, _, context) => {
                return context.prisma.user
                    .findUnique({
                    where: { id: parent.id || undefined },
                })
                    .posts();
            },
        });
    },
});
const Post = (0, nexus_1.objectType)({
    name: 'Post',
    definition(t) {
        t.nonNull.int('id');
        t.nonNull.field('createdAt', { type: 'DateTime' });
        t.nonNull.field('updatedAt', { type: 'DateTime' });
        t.nonNull.string('title');
        t.string('content');
        t.nonNull.boolean('published');
        t.nonNull.int('viewCount');
        t.field('author', {
            type: 'User',
            resolve: (parent, _, context) => {
                return context.prisma.post
                    .findUnique({
                    where: { id: parent.id || undefined },
                })
                    .author();
            },
        });
    },
});
const SortOrder = (0, nexus_1.enumType)({
    name: 'SortOrder',
    members: ['asc', 'desc'],
});
const PostOrderByUpdatedAtInput = (0, nexus_1.inputObjectType)({
    name: 'PostOrderByUpdatedAtInput',
    definition(t) {
        t.nonNull.field('updatedAt', { type: 'SortOrder' });
    },
});
const UserUniqueInput = (0, nexus_1.inputObjectType)({
    name: 'UserUniqueInput',
    definition(t) {
        t.int('id');
        t.string('email');
    },
});
const PostCreateInput = (0, nexus_1.inputObjectType)({
    name: 'PostCreateInput',
    definition(t) {
        t.nonNull.string('title');
        t.string('content');
    },
});
const UserCreateInput = (0, nexus_1.inputObjectType)({
    name: 'UserCreateInput',
    definition(t) {
        t.nonNull.string('email');
        t.string('name');
        t.list.nonNull.field('posts', { type: 'PostCreateInput' });
    },
});
exports.schema = (0, nexus_1.makeSchema)({
    types: [
        Query,
        Mutation,
        Post,
        User,
        UserUniqueInput,
        UserCreateInput,
        PostCreateInput,
        SortOrder,
        PostOrderByUpdatedAtInput,
        exports.DateTime,
    ],
    outputs: {
        schema: __dirname + '/../schema.graphql',
        typegen: __dirname + '/generated/nexus.ts',
    },
    contextType: {
        module: require.resolve('./context'),
        export: 'Context',
    },
    sourceTypes: {
        modules: [
            {
                module: '@prisma/client',
                alias: 'prisma',
            },
        ],
    },
});

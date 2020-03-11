export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, image) {
        const like = {id, title, author, img};
        this.likes.push(like);
        return like;
    }

    deleteLike(id) {
        const index
    }
}
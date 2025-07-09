
// MAX_DYNAMODB_ITEM_SIZE = 400 * 1024 (400 KB)
export const MAX_DYNAMODB_ITEM_SIZE = 350 * 1024; // 350 KB for safety as dynamodb does not allow size bigger than 400K


export default function IsLargeTextForDBInsert(text) {
    // Convert to Buffer to get byte size (handles Unicode)
    const buffer = Buffer.from(text, 'utf8');
    return buffer.length > MAX_DYNAMODB_ITEM_SIZE;
};

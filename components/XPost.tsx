import { Tweet } from 'react-tweet';

export const XPost = ({ id, caption }: { id: string; caption?: string }) => {
  if (!/^\d+$/.test(id)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('XPost: invalid post ID', id);
    }
    return null;
  }

  return (
    <figure className="my-8 flex min-w-0 flex-col items-center">
      <div className="w-full max-w-[550px]">
        <Tweet id={id} />
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-muted-foreground mt-2 px-1 leading-snug">{caption}</figcaption>
      )}
    </figure>
  );
};

import Image from "next/image";

export const Footer = () => {
  return (
    <footer className='row-start-3 flex gap-[24px] flex-wrap items-center justify-center'>
      <a
        className='flex items-center gap-2 hover:scale-125'
        href='https://github.com/SEBRATHEZEBRA/monthly-tracks'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Image
          aria-hidden
          src='/github-mark-white.svg'
          alt='GitHub logo'
          width={32}
          height={32}
        />
      </a>
    </footer>
  );
};

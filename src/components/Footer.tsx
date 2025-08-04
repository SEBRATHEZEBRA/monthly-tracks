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
      <a
        className='flex items-center gap-2 hover:scale-125'
        href='https://www.linkedin.com/in/sebastian-oliver-467b63183/'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Image
          aria-hidden
          src='/linkedin-white.png'
          alt='LinkedIn logo'
          width={32}
          height={32}
        />
      </a>
    </footer>
  );
};

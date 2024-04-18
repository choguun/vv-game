import { ColorText as VoxelizeColorText } from '@voxelize/core';

export const ColorText = ({
  children,
  callback,
  defaultColor = 'white',
  ...rest
}: {
  children?: string;
  callback?: () => void;
  defaultColor?: string;
}) => {
  return (
    <>
      {VoxelizeColorText.split(children || '', defaultColor).map(
        ({ color, text }) =>
          !color.includes('http') ? (
            <span key={text + color} style={{ color }} {...rest}>
              {text}
            </span>
          ) : (
            <a
              href={text}
              onClick={() => {
                callback?.();
              }}
              key={text + color}
              target="_blank"
              rel="noreferrer"
            >
              <span
                style={{ color: '#5DEBD7', textDecoration: 'underline' }}
                {...rest}
              >
                {text}
              </span>
            </a>
          ),
      )}
    </>
  );
};

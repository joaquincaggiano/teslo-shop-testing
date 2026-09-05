export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  // console.log({ file })
  if (!file) return callback(new Error('File is empty'), false);

  const fileExceptions = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  if (validExtensions.includes(fileExceptions)) {
    return callback(null, true);
  }

  callback(null, false);
};

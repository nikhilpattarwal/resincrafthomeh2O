// export async function uploadReferenceImage(file) {
//   const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
//   const uploadPreset = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET;

//   if (!cloudName || !uploadPreset) {
//     throw new Error('Image upload is not configured.');
//   }

//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('upload_preset', uploadPreset);
//   formData.append('folder', 'resin-craft-home/customer-references');

//   const response = await fetch(
//     `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
//     {
//       method: 'POST',
//       body: formData,
//     },
//   );

//   if (!response.ok) {
//     throw new Error(`Image upload failed: ${file.name}`);
//   }

//   const result = await response.json();

//   if (!result.secure_url) {
//     throw new Error(`No image URL returned for ${file.name}`);
//   }

//   return result.secure_url;
// }



export function uploadReferenceImage(file, onProgress) {
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Image upload is not configured.');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      let result;

      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error(`Invalid response while uploading ${file.name}`));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && result.secure_url) {
        resolve(result.secure_url);
      } else {
        reject(
          new Error(
            result.error?.message || `Image upload failed: ${file.name}`,
          ),
        );
      }
    };

    xhr.onerror = () => reject(new Error(`Network error uploading ${file.name}`));
    xhr.onabort = () => reject(new Error(`Upload cancelled: ${file.name}`));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'resin-craft-home/customer-references');

    xhr.send(formData);
  });
}
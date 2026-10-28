export async function uploadReferenceImage(file) {
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Image upload is not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'resin-craft-home/customer-references');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`Image upload failed: ${file.name}`);
  }

  const result = await response.json();

  if (!result.secure_url) {
    throw new Error(`No image URL returned for ${file.name}`);
  }

  return result.secure_url;
}
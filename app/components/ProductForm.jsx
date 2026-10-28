
import {useState,useRef} from 'react';
import {Link, useNavigate} from 'react-router';
import {
  LuShoppingCart,
  LuPlus,
  LuMinus,
  LuShieldCheck,
} from 'react-icons/lu';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';

export function ProductForm({productOptions, selectedVariant}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);
     const [customName, setCustomName] = useState('');
const [customInstructions, setCustomInstructions] = useState('');
const [referenceImages, setReferenceImages] = useState([]);
const [isUploadingImages, setIsUploadingImages] = useState(false);
  const available = Boolean(selectedVariant?.availableForSale);

const [uploadError, setUploadError] = useState('');
const imageInputRef = useRef(null);

// const handleImageChange = (event) => {
//   const files = Array.from(event.target.files || []);
//   const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
//   const maxFileSize = 5 * 1024 * 1024;
//   const maxFiles = 5;

//   setUploadError('');

//   if (files.length > maxFiles) {
//     setUploadError('Please select no more than 5 images.');
//     event.target.value = '';
//     return;
//   }

//   const invalidFile = files.find(
//     (file) =>
//       !allowedTypes.includes(file.type) ||
//       file.size > maxFileSize,
//   );

//   if (invalidFile) {
//     setUploadError(
//       'Use JPG, PNG, or WebP images, up to 5 MB each.',
//     );
//     event.target.value = '';
//     return;
//   }

//   setReferenceImages(files);
// };

const handleImageChange = async (event) => {
  const files = Array.from(event.target.files || []);
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxFileSize = 5 * 1024 * 1024;
  const maxFiles = 5;

  setUploadError('');
  setReferenceImages([]);
  setReferenceImageUrls([]);

  if (files.length > maxFiles) {
    setUploadError('Please select no more than 5 images.');
    event.target.value = '';
    return;
  }

  const invalidFile = files.find(
    (file) =>
      !allowedTypes.includes(file.type) ||
      file.size > maxFileSize,
  );

  if (invalidFile) {
    setUploadError(
      'Use JPG, PNG, or WebP images, up to 5 MB each.',
    );
    event.target.value = '';
    return;
  }

  if (files.length === 0) return;

  setReferenceImages(files);
  setIsUploadingImages(true);

  try {
    const cloudName =
      import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing.');
    }

    const urls = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          },
        );

        const result = await response.json();

        if (!response.ok || !result.secure_url) {
          throw new Error(
            result.error?.message || `Failed to upload ${file.name}`,
          );
        }

        return result.secure_url;
      }),
    );

    setReferenceImageUrls(urls);
  } catch (error) {
    console.error('Reference image upload failed:', error);
    setReferenceImages([]);
    setReferenceImageUrls([]);
    setUploadError(
      error.message || 'Image upload failed. Please try again.',
    );
  } finally {
    setIsUploadingImages(false);
  }
};

  return (
    <div className="rch-product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        const selectedOption = option.optionValues.find(
          (value) => value.selected,
        );

        return (
          <div className="rch-product-option" key={option.name}>
            <div className="rch-product-option__heading">
              <span>{option.name}</span>
              <span className="rch-product-option__selected">
                {selectedOption?.name}
              </span>
            </div>

            <div className="rch-product-option__values">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available: valueAvailable,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const className = [
                  'rch-product-option__value',
                  selected ? 'is-selected' : '',
                  !valueAvailable ? 'is-unavailable' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                if (isDifferentProduct) {
                  return (
                    <Link
                      key={`${option.name}-${name}`}
                      className={className}
                      to={`/products/${handle}?${variantUriQuery}`}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      aria-label={name}
                      aria-current={selected ? 'true' : undefined}
                      title={name}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    key={`${option.name}-${name}`}
                    className={className}
                    disabled={!exists}
                    aria-label={name}
                    aria-pressed={selected}
                    title={name}
                    onClick={() => {
                      if (!selected) {
                        setQuantity(1);
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="rch-product-stock">
        
        
        <span
          className={`rch-product-stock__dot ${
            available ? 'is-available' : 'is-unavailable'
          }`}
        />
        <span>
          {available ? 'Ready to be yours' : 'Currently unavailable'}
        </span>
        
      </div>

      
<div className="rch-customization">
  <h3>Personalize your product</h3>

  <label htmlFor="custom-name">
    Name or text to personalize
  </label>
  <input
    id="custom-name"
    type="text"
    value={customName}
    onChange={(event) => setCustomName(event.target.value)}
    maxLength={150}
    placeholder="Enter a name, date, or message"
  />

  <label htmlFor="custom-instructions">
    Customization instructions
  </label>
  <textarea
    id="custom-instructions"
    value={customInstructions}
    onChange={(event) =>
      setCustomInstructions(event.target.value)
    }
    maxLength={1000}
    rows={4}
    placeholder="Describe your preferred colors, design, or details..."
  />

  <label htmlFor="reference-images">
    Reference images (up to 5)
  </label>
  <input
    ref={imageInputRef}
    id="reference-images"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    onChange={handleImageChange}
  />

 {referenceImages.length > 0 && (
  <ul>
    {referenceImages.map((file) => (
      <li key={`${file.name}-${file.size}`}>
        {file.name}
      </li>
    ))}
  </ul>
)}

{/* Upload status */}
{isUploadingImages && (
  <p role="status">
    Uploading reference images...
  </p>
)}

{!isUploadingImages &&
  referenceImages.length > 0 &&
  referenceImageUrls.length === referenceImages.length && (
    <p role="status">
      {referenceImageUrls.length} reference image(s) uploaded.
    </p>
)}

{/* Upload error */}
{uploadError && (
  <p role="alert" className="rch-customization__error">
    {uploadError}
  </p>
)}
</div>

      

      
 
<div
  className="rch-product-purchase"
  style={{
    display: 'grid',
    gridTemplateColumns: '140px minmax(0, 1fr)',
    alignItems: 'stretch',
    gap: '12px',
    width: '100%',
    minWidth: 0,
  }}
>
  <div
    className="rch-quantity"
    aria-label="Quantity selector"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '140px',
      minWidth: 0,
      height: '52px',
      padding: '0 8px',
      boxSizing: 'border-box',
      border: '1px solid #ded4c8',
      borderRadius: '3px',
      background: '#fffdf9',
    }}
  >
    <button
      type="button"
      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
      disabled={quantity <= 1}
      aria-label="Decrease quantity"
      style={{
        display: 'grid',
        placeItems: 'center',
        width: '32px',
        height: '44px',
        padding: 0,
        border: 0,
        background: 'transparent',
        color: '#332923',
        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
        opacity: quantity <= 1 ? 0.4 : 1,
      }}
    >
      <LuMinus size={16} aria-hidden="true" />
    </button>

    <span
      aria-live="polite"
      style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '14px',
        color: '#332923',
      }}
    >
      {quantity}
    </span>

    <button
      type="button"
      onClick={() => setQuantity((current) => Math.min(99, current + 1))}
      disabled={quantity >= 99}
      aria-label="Increase quantity"
      style={{
        display: 'grid',
        placeItems: 'center',
        width: '32px',
        height: '44px',
        padding: 0,
        border: 0,
        background: 'transparent',
        color: '#332923',
        cursor: quantity >= 99 ? 'not-allowed' : 'pointer',
        opacity: quantity >= 99 ? 0.4 : 1,
      }}
    >
      <LuPlus size={16} aria-hidden="true" />
    </button>
  </div>

  <AddToCartButton
    className="rch-add-to-cart"
    disabled={
      !available ||
      isUploadingImages ||
      referenceImageUrls.length !== referenceImages.length
    }
    onClick={() => open('cart')}
   
lines={
  selectedVariant
    ? [
        {
          merchandiseId: selectedVariant.id,
          quantity,
          selectedVariant,
          attributes: [
            {
              key: 'Personalized name or text',
              value: customName.trim(),
            },
            {
              key: 'Customization instructions',
              value: customInstructions.trim(),
            },
            ...referenceImageUrls.map((url, index) => ({
              key: `Reference image ${index + 1}`,
              value: url,
            })),
          ].filter((attribute) => attribute.value),
        },
      ]
    : []
}

    style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '9px',
      width: '100%',
      minWidth: 0,
      minHeight: '52px',
      padding: '10px 12px',
      boxSizing: 'border-box',
      border: `1px solid ${available ? '#355c45' : '#d6d3d1'}`,
      borderRadius: '3px',
      background: available ? '#355c45' : '#e7e5e4',
      color: available ? '#ffffff' : '#78716c',
      fontFamily: 'inherit',
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.03em',
      lineHeight: 1.3,
      cursor: available ? 'pointer' : 'not-allowed',
      opacity: 1,
    }}
  >
    <LuShoppingCart
      size={17}
      style={{flexShrink: 0}}
      aria-hidden="true"
    />

    <span>{available ? 'Add to bag' : 'Sold out'}</span>

    {available && (
      <span aria-hidden="true" style={{marginLeft: 'auto'}}>
        ↗
      </span>
    )}
  </AddToCartButton>
</div>



      <p className="rch-product-form-note">
        <LuShieldCheck aria-hidden="true" />
        <span>Thoughtfully handcrafted. Carefully packed.</span>
      </p>
    </div>
  );
}

function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) {
    return <span className="rch-product-option__text">{name}</span>;
  }

  return (
    <span
      className="rch-product-swatch"
      title={name}
      style={{backgroundColor: color || 'transparent'}}
    >
      {image && <img src={image} alt="" loading="lazy" />}
    </span>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */

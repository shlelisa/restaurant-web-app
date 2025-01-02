import supabase from '../config/supabaseClient';

export const uploadMenuImage = async (file) => {
  try {
    // Create a URL for the image
    const imageUrl = `/images/menu/${file.name}`;
    return imageUrl;
  } catch (error) {
    console.error('Error handling image:', error);
    throw error;
  }
}; 
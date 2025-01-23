// export default {
//   JWT_SECRET: "W6ztYI9k0mL6PjFxV5YWrj8jLJ0k+2eZ3VwJs6uIHH0=",
// };

import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

export default {
  JWT_SECRET: process.env.JWT_SECRET, // Use JWT_SECRET from .env
  ATLAS_URI: process.env.ATLAS_URI, // Use ATLAS_URI from .env
};

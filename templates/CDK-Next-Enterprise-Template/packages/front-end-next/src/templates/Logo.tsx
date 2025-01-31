import { AppConfig } from '@/utils/AppConfig';

const Logo = () => (
  <div className="flex items-center text-xl font-semibold">
    <img
      src="/assets/images/oasify-thin.png" // Path to your logo image in the public folder
      alt={`${AppConfig.name} Logo`} // Alt text for accessibility
      className="h-16 w-auto mr-2 md:h-16 lg:h-20 object-contain" // Increase height values
    />
  </div>
);

export { Logo };

# react-custom-clock

`react-custom-clock` is a highly customizable React component for creating clocks with a wide range of styles and options. It provides powerful customization features to suit various design needs, allowing you to build almost any clock style you can imagine. With no dependencies and extensive configuration options, it's perfect for integrating a clock into your React application.

## Features

- **Extensive Customization**: Customize every aspect of the clock, including the face, hands, ticks, and more.
- **No Dependencies**: A standalone package with no external dependencies, only dev-dependencies.
- **Default Styles**: Comes with default styles so you can use it out of the box without any props.
- **Real-time Updates**: Supports real-time updates to reflect the current time dynamically.
- **Responsive Design**: Adaptable to various screen sizes and resolutions.

## Installation

To install the package, use npm or yarn:

```
npm install react-custom-clock
```

or

```
yarn add react-custom-clock
```

## Usage

To use the `react-custom-clock` component, import it into your React application and include it in your JSX. You can configure the clock using the available options.

```jsx
import React from "react";
import { Clock } from "react-custom-clock";

const App = () => {
  return (
    <div>
      <Clock />
    </div>
  );
};

export default App;
```

## Configuration Options

The `Clock` component supports various options to customize its appearance and behavior. You can adjust the clock's face, hands, ticks, and interface settings according to your needs. Below are the key configuration options:

### Face Options

- **background**: The background color of the clock face.
- **padding**: The padding around the clock face.
- **ticks**: Configuration options for the ticks (markings) on the clock.
  - **regular**: Options for regular ticks.
  - **secondary**: Options for secondary ticks.
  - **primary**: Options for primary ticks.
- **counts**: Configuration options for the count numbers on the clock.
  - **hour**: Options for hour counts.
  - **minute**: Options for minute counts.

### Interface Options

- **dynamic**: Enables or disables the time increments every second. If `true`, the clock updates every second. If `false`, the clock does not update dynamically.
- **showDiscreteTime**: Determines if the clock should show discrete time. When enabled, the clock hands will align to discrete intervals (e.g., at 5:00, the hour hand will be exactly at 5). If disabled, the hands will be positioned smoothly between intervals.
- **transition**: The duration of the transition effect (in milliseconds) for clock hand movements.
- **pivot**: Configuration options for the pivot point of the clock hands.
  - **size**: The size of the pivot.
  - **background**: The background color of the pivot.

### Hand Options

- **hourHand**: Configuration options for the hour hand.
  - **front**: Options for the front part of the hour hand.
  - **frontBase**: Options for the front base of the hour hand.
  - **back**: Options for the back part of the hour hand.
- **minuteHand**: Configuration options for the minute hand.
  - **front**: Options for the front part of the minute hand.
  - **frontBase**: Options for the front base of the minute hand.
  - **back**: Options for the back part of the minute hand.
- **secondHand**: Configuration options for the second hand.
  - **front**: Options for the front part of the second hand.
  - **frontBase**: Options for the front base of the second hand.
  - **back**: Options for the back part of the second hand.

For detailed descriptions of each option, refer to the documentation provided in the source code or view the [source code](https://github.com/satyam-mishra-pce/react-custom-clock).

## Contributing

Contributions are welcome! If you'd like to contribute to the development of `react-custom-clock`, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/satyam-mishra-pce/react-custom-clock/blob/main/LICENSE) file for details.

## Support

If you have any questions or need help with `react-custom-clock`, please open an issue on the [GitHub repository](https://github.com/satyam-mishra-pce/react-custom-clock/issues).

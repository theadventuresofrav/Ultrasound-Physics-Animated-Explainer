import type { Category } from '../types';

export const categories: Category[] = [
  {
    title: "Ultrasound Physics Principles",
    questions: [
      {
        scenario: "You are performing an abdominal ultrasound on a patient. Based on the principles of thermal bioeffects, where would you expect the largest temperature rise in tissue to occur?",
        answer: "The highest temperatures tend to occur in tissue in the region between where the ultrasound beam enters the tissue and the focal region.",
        imageUrl: "https://placehold.co/400x250/F0F9FF/0E7490?text=Thermal+Bioeffects%0A(Focal+Region)"
      },
      {
        scenario: "A sonographer wants to ensure the best diagnostic information is obtained while keeping total ultrasound exposure to the patient as low as reasonably achievable. What is this guiding principle called?",
        answer: "This principle is called ALARA, which stands for \"as low as reasonably achievable\".",
        imageUrl: "https://placehold.co/400x250/ECFDF5/059669?text=ALARA+Principle%0A(As+Low+As+Reasonably+Achievable)"
      },
      {
        scenario: "You are conducting an ultrasound examination and need to determine the exposure time. What is the primary factor that determines how quickly you can obtain a useful image and thus the length of the examination?",
        answer: "Primarily, it is your training, education, and experience that determine how quickly a useful image can be obtained, influencing the length of the examination and exposure.",
        imageUrl: "https://placehold.co/400x250/FDF2F8/DB2777?text=Sonographer+Experience"
      },
      {
        scenario: "You notice that the far field of your ultrasound image appears too dark. To correct this and brighten the image, what is the recommended first adjustment you should make?",
        answer: "You should increase the receiver gain.",
        imageUrl: "https://placehold.co/400x250/E0F2FE/0891B2?text=Low+Gain+(Dark)+vs+High+Gain+(Bright)"
      },
      {
        scenario: "A sound wave with an initial intensity of 2 mW/cm² undergoes a change of +9 dB. What is the final intensity of the wave?",
        answer: "The final intensity will be 16 mW/cm². (An increase of 3 dB doubles the intensity, so +9 dB is 2x2x2 = 8 times the original intensity. 2 mW/cm² * 8 = 16 mW/cm²).",
        imageUrl: "https://placehold.co/400x250/E0F2FE/0891B2?text=Intensity+Graph%0A2mW/cm%C2%B2+->+16mW/cm%C2%B2+(+9dB)"
      },
      {
        scenario: "You are comparing two tissues. Tissue A has an acoustic impedance of 1.5 Mrayls, and Tissue B also has an impedance of 1.5 Mrayls. If a sound wave strikes the boundary between them at a 90-degree angle, what percentage of the intensity will be transmitted?",
        answer: "If the impedances of the two media are identical, 100% of the intensity will be transmitted, and there will be no reflection.",
        imageUrl: "https://placehold.co/400x250/E0F2FE/0891B2?text=Impedance+Match+%3D+100%25+Transmission"
      },
      {
        scenario: "You are given a specific ultrasound wave and are told it is infrasonic. What can you immediately infer about its frequency?",
        answer: "Infrasound is defined as an acoustic wave with a frequency less than 20 Hz.",
        imageUrl: "https://placehold.co/400x250/F0F9FF/0E7490?text=Infrasound%0A(<20Hz)"
      },
      {
        scenario: "A sound beam travels a total distance of 10 cm in 2 seconds. What is the propagation speed of this sound wave?",
        answer: "The speed of the sound is 5 cm/sec (10 cm / 2 sec = 5 cm/sec).",
        imageUrl: "https://placehold.co/400x250/ECFDF5/059669?text=Propagation+Speed%0A(Distance+%2F+Time)"
      },
      {
        scenario: "You are asked to identify a material with a high acoustic impedance coefficient. Which of the following states of matter generally possesses a higher acoustic impedance coefficient?",
        answer: "Solids generally have a higher acoustic impedance coefficient.",
        imageUrl: "https://placehold.co/400x250/FDF2F8/DB2777?text=Acoustic+Impedance%0A(Solids+High)"
      },
      {
        scenario: "An ultrasound image displays a region described as \"hyperechoic.\" What does this term indicate about the echoes returning from that region?",
        answer: "A hyperechoic region is echogenic, meaning it produces echoes.",
        imageUrl: "https://placehold.co/400x250/E0F2FE/0891B2?text=Diagram+of+Hyperechoic+Region%0A(Bright+Area)"
      },
      {
        scenario: "You need to recall the average velocity of ultrasound in soft tissue. What is this value?",
        answer: "The average velocity of ultrasound in soft tissue is 1540 meters per second.",
        imageUrl: "https://placehold.co/400x250/F0F9FF/0E7490?text=Soft+Tissue+Velocity%0A(1540+m%2Fs)"
      },
      {
        scenario: "While adjusting system controls, you increase the output gain. How does this action directly affect the acoustic exposure to the patient?",
        answer: "Increasing the output gain increases the acoustic exposure to the patient.",
        imageUrl: "https://placehold.co/400x250/ECFDF5/059669?text=Output+Gain%0A(Increases+Exposure)"
      },
      {
        scenario: "You are explaining the phenomenon of tissue heating during an ultrasound exam. What is the primary process by which tissue heats as ultrasound travels through it?",
        answer: "The primary reason tissue heats as sound is attenuated in the human body is absorption, where acoustic energy is converted into heat.",
        imageUrl: "https://placehold.co/400x250/FDF2F8/DB2777?text=Tissue+Heating%0A(Absorption)"
      },
      {
        scenario: "If the amplitude of a sound wave is halved, what immediate effect does this have on its intensity?",
        answer: "If the amplitude of a signal is halved, the resulting intensity is one fourth the original intensity.",
        imageUrl: "https://placehold.co/400x250/E0F2FE/0891B2?text=Amplitude+%2F+2+%3D+Intensity+%2F+4"
      },
      {
        scenario: "You are asked about the typical frequency range used for diagnostic ultrasound imaging. What is this range?",
        answer: "The typical range of frequency for diagnostic ultrasound imaging is 1 to 20 MHz.",
        imageUrl: "https://placehold.co/400x250/F0F9FF/0E7490?text=Diagnostic+Frequency%0A(1-20+MHz)"
      },
      {
        scenario: "You observe that the Pulse Repetition Frequency (PRF) of your ultrasound system increases. What consistent effect does this have on the duty factor?",
        answer: "If the PRF increases, the duty factor increases.",
        imageUrl: "https://placehold.co/400x250/ECFDF5/059669?text=PRF+%E2%86%91%2C+Duty+Factor+%E2%86%91"
      },
      {
        scenario: "You are calculating the attenuation coefficient for a 6.0 MHz ultrasound beam in soft tissue. What is the approximate value for this?",
        answer: "The attenuation coefficient in soft tissue is approximately one half of the operating frequency, so for 6.0 MHz, it's about 3 dB/cm.",
        imageUrl: "https://placehold.co/400x250/FDF2F8/DB2777?text=Attenuation+Coefficient%0A(Freq%2F2)"
      },
      {
        scenario: "You need to describe the percentage of time that the ultrasound system is producing pulses of ultrasound. What is the term for this?",
        answer: "This describes the duty factor.",
        imageUrl: "https://placehold.co/400x250/F0F9FF/0E7490?text=Duty+Factor%0A(%25+Time+Pulsing)"
      },
      {
        scenario: "You are analyzing how sound travels through different media. If only the density of a medium is increased, what happens to the propagation speed within that medium?",
        answer: "If only the density of a medium is increased, the propagation speed will decrease because density and propagation speed are inversely related.",
        imageUrl: "https://placehold.co/400x250/ECFDF5/059669?text=Density+%E2%86%91%2C+Speed+%E2%86%93"
      },
      {
        scenario: "You observe a strong, echo-free region appearing directly behind a weakly attenuating structure on your ultrasound image. What useful artifact is this demonstrating?",
        answer: "This is an example of enhancement, a useful artifact seen behind weakly attenuating structures.",
        imageUrl: "https://placehold.co/400x250/E0F2FE/0891B2?text=Enhancement+Artifact%0A(Bright+region+behind+cyst)"
      },
      {
        scenario: "A sonographer is using a 3 MHz transducer and increases the output power to visualize deeper structures. No other controls are adjusted. What happens to the spatial pulse length?",
        answer: "The spatial pulse length remains the same, as it is a characteristic of the pulse itself and is inherent in the transducer system's design, not affected by output power.",
        imageUrl: "https://placehold.co/400x250/FDF2F8/DB2777?text=Spatial+Pulse+Length%0A(Constant)"
      },
      {
        scenario: "You are asked for the unit of measurement for pressure as an acoustic variable. What is the appropriate unit?",
        answer: "Pressure is typically expressed in Pascals (Pa).",
        imageUrl: "https://placehold.co/400x250/F0F9FF/0E7490?text=Pressure+Unit%0A(Pascals)"
      },
      {
        scenario: "What type of wave is sound fundamentally considered to be?",
        answer: "Sound is technically a mechanical and longitudinal wave.",
        imageUrl: "https://placehold.co/400x250/ECFDF5/059669?text=Sound+Wave%0A(Mechanical%2C+Longitudinal)"
      },
      {
        scenario: "When the power in an acoustic beam is doubled and the cross-sectional area of the beam is halved, what happens to the intensity of the beam?",
        answer: "The intensity rises to four times its original value.",
        imageUrl: "https://placehold.co/400x250/FDF2F8/DB2777?text=Power+%2F+Area+%3D+Intensity"
      },
      {
        scenario: "You need to determine how many different shades of gray can be stored with 4 bits of memory.",
        answer: "With 4 bits of memory, 16 different shades of gray can be stored (2^4 = 16).",
        imageUrl: "https://placehold.co/400x250/F0F9FF/0E7490?text=4+Bits+%3D+16+Shades+of+Gray"
      },
      {
        scenario: "What is the specific term used to describe the redirection of the sound beam in many directions from a reflector that is small relative to the wavelength?",
        answer: "This phenomenon is called Rayleigh scattering.",
        imageUrl: "https://placehold.co/400x250/ECFDF5/059669?text=Rayleigh+Scattering"
      },
      {
        scenario: "You are presented with a graph showing two variables where, as the value of the x-variable (temperature) increases, the value of the y-variable (clothing) decreases. What type of relationship do these variables have?",
        answer: "This describes an inverse relationship.",
        imageUrl: "https://placehold.co/400x250/FDF2F8/DB2777?text=Inverse+Relationship+Graph"
      },
      {
        scenario: "What is the minimum radiation dose threshold that typically results in epilation?",
        answer: "The minimum radiation dose threshold that typically results in epilation is 3 Gy.",
        imageUrl: "https://placehold.co/400x250/F0F9FF/0E7490?text=Epilation+Dose%0A(3+Gy)"
      },
      {
        scenario: "You are analyzing the fundamental properties that define sound waves. Which of the following is considered an acoustic variable?",
        answer: "Density is an acoustic variable.",
        imageUrl: "https://placehold.co/400x250/ECFDF5/059669?text=Acoustic+Variable%0A(Density)"
      },
      {
        scenario: "What does the Output Display Standard (ODS) aim to achieve?",
        answer: "The goal of the ODS is to make users aware of the actual output of their ultrasound equipment as it is being used, providing real-time information about the potential for bioeffects.",
        imageUrl: "https://placehold.co/400x250/FDF2F8/DB2777?text=Output+Display+Standard%0A(Bioeffects+Awareness)"
      }
    ]
  },
  {
    title: "Transducers & Imaging Components",
    questions: [
        {
            scenario: "You are evaluating the performance of an ultrasound system's resolution. In clinical imaging, which type of resolution is generally considered to be the best?",
            answer: "Axial resolution is best in clinical imaging.",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=Axial+Resolution%0A(Best+in+Imaging)"
        },
        {
            scenario: "You are selecting a transducer and want to increase the near zone length. Which combination of transducer characteristics would achieve this?",
            answer: "A large crystal diameter and high frequency would increase the near zone length.",
            imageUrl: "https://placehold.co/400x250/CCFBF1/0F766E?text=Longer+Near+Zone%0A(Large+Diameter+%26+High+Freq)"
        },
        {
            scenario: "What is the primary purpose of the matching layer in an ultrasound transducer?",
            answer: "The matching layer facilitates the transmission of sound from the element into the patient’s skin by stepping down the impedance.",
            imageUrl: "https://placehold.co/400x250/CCFBF1/0F766E?text=Transducer+Matching+Layer+Diagram"
        },
        {
            scenario: "You are observing the effects of damping material on a transducer. What is the main effect damping material has on the spatial pulse length (SPL)?",
            answer: "Damping material reduces (decreases) the spatial pulse length.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=Damping+%E2%86%93+SPL"
        },
        {
            scenario: "You are examining a transducer with elements arranged in a concentric pattern. What type of transducer is this?",
            answer: "This describes an annular array transducer.",
            imageUrl: "https://placehold.co/400x250/CCFBF1/0F766E?text=Annular+Array%0A(Concentric+Rings)"
        },
        {
            scenario: "Which type of transducer is characterized by mechanically sweeping the piezoelectric elements to steer the beam?",
            answer: "A mechanical transducer uses a motor or mechanical sweeping to steer the beam.",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=Mechanical+Transducer%0A(Sweeping+Beam)"
        },
        {
            scenario: "What effect does the damping material have on the quality factor (Q-factor) of a transducer?",
            answer: "Damping material decreases the quality factor.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=Damping+%E2%86%93+Q-Factor"
        },
        {
            scenario: "If you need to image deep structures in the abdomen, which type of transducer would typically be best utilized due to its penetration capabilities?",
            answer: "A curved sequenced array transducer would be best utilized for imaging deep structures in the abdomen.",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=Curved+Array+Transducer%0A(Deep+Imaging)"
        },
        {
            scenario: "What happens to an ultrasound transducer if it undergoes heat sterilization?",
            answer: "Heat sterilization kills pathogens but unfortunately destroys the transducer.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=Heat+Sterilization%0A(Destroys+Transducer)"
        },
        {
            scenario: "Which type of transducer has a higher Q-factor: therapeutic or imaging transducers?",
            answer: "Therapeutic transducers have a higher Q-factor than imaging transducers.",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=Therapeutic+Transducers%0A(High+Q-Factor)"
        },
        {
            scenario: "Which specific type of transducer is no longer used for imaging?",
            answer: "Annular array transducers are no longer used for imaging.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=Annular+Array%0A(No+Longer+Used)"
        },
        {
            scenario: "What term describes the range of frequencies present within the sound beam?",
            answer: "This is defined as the bandwidth.",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=Bandwidth%0A(Frequency+Range)"
        },
        {
            scenario: "What is the minimum number of active elements that a mechanical transducer typically has?",
            answer: "The minimum number of active elements in a mechanical transducer is 1.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=Mechanical+Transducer%0A(1+Element)"
        },
        {
            scenario: "What is the typical voltage range of the signal produced by the pulser that excites a piezoelectric crystal?",
            answer: "The signal typically produced by the pulser is in the range of hundreds of volts.",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=Pulser+Voltage%0A(Hundreds+of+Volts)"
        },
        {
            scenario: "What is the purpose of attaching backing material to the piezoelectric element in an imaging transducer?",
            answer: "The backing material shortens the pulse by decreasing the number of cycles in a pulse.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=Backing+Material%0A(Shortens+Pulse)"
        },
        {
            scenario: "You are troubleshooting an image display. What type of video display is limited to only black and white, with no other shades of gray?",
            answer: "A display limited to only black and white, with no other shades of gray, is called bistable.",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=Bistable+Display%0A(Black+%26+White)"
        },
        {
            scenario: "In a standard cathode ray tube (CRT) used to display ultrasound images, what are the charged particles that are emitted from a \"gun\" at the rear of the tube?",
            answer: "The charged particles emitted are electrons.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=CRT+Electrons"
        },
        {
            scenario: "With 6 bits of memory, what is the largest number of different shades of gray that can be stored?",
            answer: "With 6 bits, the largest number of different shades of gray that can be stored is 64 (2^6).",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=6+Bits+%3D+64+Shades+of+Gray"
        },
        {
            scenario: "Which ultrasound mode is primarily used to measure distance, often representing the depth of the signal in the horizontal dimension?",
            answer: "A-Mode is mainly used to measure distance, representing the depth of the signal in the horizontal dimension.",
            imageUrl: "https://placehold.co/400x250/CCFBF1/0F766E?text=A-Mode+Display%0A(Depth+vs+Amplitude)"
        },
        {
            scenario: "Which mode in ultrasound imaging is primarily interested in documenting the movement of reflectors along one scan line, such as heart valve motion?",
            answer: "M-mode (motion mode) is used when documentation of the movement of a reflector is needed.",
            imageUrl: "https://placehold.co/400x250/CCFBF1/0F766E?text=M-Mode+Display%0A(Depth+vs+Time)"
        },
        {
            scenario: "In M-mode imaging, what type of information is typically represented along the x-axis of the display?",
            answer: "Time is along the x-axis of an M-mode image.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=M-Mode+X-Axis%0A(Time)"
        },
        {
            scenario: "What is the smallest component of a 3D image?",
            answer: "The smallest component of a 3D image is the voxel.",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=Smallest+3D+Component%0A(Voxel)"
        },
        {
            scenario: "What technique uses made-up pixel information to replace areas between scan lines where there is no actual signal information?",
            answer: "This technique is called fill-in interpolation.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=Fill-in+Interpolation"
        },
        {
            scenario: "Which part of the ultrasound machine does NOT affect the amount of energy entering the patient?",
            answer: "The receiver does not affect the amount of energy entering the patient.",
            imageUrl: "https://placehold.co/400x250/FFEFD5/E65100?text=Receiver%0A(No+Patient+Energy)"
        },
        {
            scenario: "What system component is responsible for timing the reception of the pulses to determine their location?",
            answer: "The master synchronizer is responsible for timing the reception of the pulses to determine their location.",
            imageUrl: "https://placehold.co/400x250/FFF3E0/EF6C00?text=Master+Synchronizer%0A(Pulse+Timing)"
        }
    ]
  },
  {
    title: "Hemodynamics & Doppler Principles",
    questions: [
        {
            scenario: "You are performing a spectral Doppler examination and notice aliasing. You increase the PRF/scale setting. What effect does this have on the potential for aliasing?",
            answer: "Increasing the PRF/scale setting decreases the potential of aliasing.",
            imageUrl: "https://placehold.co/400x250/FEF9C3/B45309?text=Aliasing+vs+Corrected+Waveform"
        },
        {
            scenario: "Under what angle of insonation is the Doppler shift highest?",
            answer: "The Doppler shift is highest when the beam is parallel (0 degrees) to the direction of flow.",
            imageUrl: "https://placehold.co/400x250/FEF9C3/B45309?text=Doppler+Angle%0A0%C2%B0+%3D+Max+Shift%2C+90%C2%B0+%3D+No+Shift"
        },
        {
            scenario: "At what Reynolds number does turbulence typically begin to be predicted?",
            answer: "The point at which the Reynolds number predicts turbulence is 2000.",
            imageUrl: "https://placehold.co/400x250/FFFBEB/D97706?text=Reynolds+Number%0A(Turbulence+%40+2000)"
        },
        {
            scenario: "A patient is standing upright. Where in their body would the hydrostatic pressure be highest?",
            answer: "In a standing patient, the hydrostatic pressure is highest in the feet.",
            imageUrl: "https://placehold.co/400x250/FDFCEF/B45309?text=Hydrostatic+Pressure%0A(Highest+in+Feet)"
        },
        {
            scenario: "What mathematical processing technique is used to analyze Doppler data and produce a spectral waveform display?",
            answer: "Fast Fourier transform (FFT) is the mathematical processing technique used for spectral waveforms.",
            imageUrl: "https://placehold.co/400x250/FFFBEB/D97706?text=Fast+Fourier+Transform%0A(Doppler+Analysis)"
        },
        {
            scenario: "In a spectral Doppler display, what does the brightness of the dots that make up the display represent?",
            answer: "The brightness of the dots represents the number of red blood cells present.",
            imageUrl: "https://placehold.co/400x250/FDFCEF/B45309?text=Doppler+Brightness%0A(RBC+Count)"
        },
        {
            scenario: "You want to add more spectral Doppler waveforms to the display screen. What setting on the machine should you adjust?",
            answer: "You should adjust the sweep speed.",
            imageUrl: "https://placehold.co/400x250/FFFBEB/D97706?text=Sweep+Speed%0A(More+Waveforms)"
        },
        {
            scenario: "Which type of Doppler modality does not rely on the frequency shift but instead relies on the strength or amplitude of the shift?",
            answer: "Power Doppler does not rely on frequency shift but on the strength of the shift.",
            imageUrl: "https://placehold.co/400x250/FDFCEF/B45309?text=Power+Doppler%0A(Amplitude+Based)"
        },
        {
            scenario: "What is the duty factor of Continuous Wave (CW) Doppler?",
            answer: "The duty factor for continuous wave ultrasound is 100% or 1.",
            imageUrl: "https://placehold.co/400x250/FFFBEB/D97706?text=CW+Doppler+Duty+Factor%0A(100%25)"
        },
        {
            scenario: "You are using a Pulsed Wave (PW) Doppler device. What is the fewest number of crystals such a device may have?",
            answer: "A PW Doppler device may have one crystal.",
            imageUrl: "https://placehold.co/400x250/FDFCEF/B45309?text=PW+Doppler%0A(1+Crystal)"
        },
        {
            scenario: "You are performing an ultrasound on a patient. What happens to venous return to the heart when an individual inhales?",
            answer: "Upon inspiration (inhaling), venous return to the heart increases.",
            imageUrl: "https://placehold.co/400x250/FFFBEB/D97706?text=Inspiration%0A(Heart+Venous+Return+%E2%86%91)"
        },
        {
            scenario: "You are observing venous flow in the legs. What happens to venous flow in the legs when an individual inhales?",
            answer: "Upon inspiration (inhaling), venous flow in the legs decreases.",
            imageUrl: "https://placehold.co/400x250/FDFCEF/B45309?text=Inspiration%0A(Leg+Venous+Flow+%E2%86%93)"
        },
        {
            scenario: "What happens to the diaphragm when an individual breathes in?",
            answer: "Upon inspiration (breathing in), the diaphragm moves downward into the abdomen.",
            imageUrl: "https://placehold.co/400x250/FFFBEB/D97706?text=Diaphragm+Movement%0A(Inspiration)"
        },
        {
            scenario: "What is the typical range of Doppler shift frequencies found in diagnostic imaging examinations?",
            answer: "The typical range of Doppler shift found in diagnostic imaging examinations is between 20 Hz and 20 kHz (in the audible range).",
            imageUrl: "https://placehold.co/400x250/FDFCEF/B45309?text=Doppler+Shift+Freq%0A(20+Hz+-+20+kHz)"
        },
        {
            scenario: "What phenomenon occurs when very high velocities appear negative in a Doppler display?",
            answer: "This phenomenon is called aliasing.",
            imageUrl: "https://placehold.co/400x250/FEF9C3/B45309?text=Aliasing%3A+Waveform+Wraps+Around"
        }
    ]
  },
  {
    title: "Quality Assurance & Patient Care",
    questions: [
        {
            scenario: "As a sonographer, you are responsible for maintaining the ultrasound equipment. How often must comprehensive preventative maintenance be performed at minimum?",
            answer: "Comprehensive preventative maintenance must be performed at least semiannually.",
            imageUrl: "https://placehold.co/400x250/D1FAE5/065F46?text=Preventative+Maintenance%0A(Semiannual)"
        },
        {
            scenario: "You need to evaluate the flow direction, depth capability, and accuracy of sample volume location for a Doppler system. Which specific test object would you use for this purpose?",
            answer: "The Doppler phantom is used for these evaluations.",
            imageUrl: "https://placehold.co/400x250/DCFCE7/047857?text=Doppler+Phantom%0A(Flow+Evaluation)"
        },
        {
            scenario: "What is considered the most effective way to prevent the spread of infection in a clinical setting?",
            answer: "Hand washing is the most effective way to prevent the spread of infection.",
            imageUrl: "https://placehold.co/400x250/D1FAE5/065F46?text=Hand+Washing%0A(Infection+Prevention)"
        },
        {
            scenario: "Which form of cavitation has the most potential for inducing biologic damage?",
            answer: "Transient cavitation has the most potential for inducing biologic damage because it involves the bursting of microbubbles, leading to shock waves and local temperature increases.",
            imageUrl: "https://placehold.co/400x250/DCFCE7/047857?text=Transient+Cavitation%0A(Highest+Damage)"
        },
        {
            scenario: "You are about to perform a sonographic procedure. Beyond simply asking the patient their name, what specific information from the patient's wristband should you verify for proper patient identification?",
            answer: "You should verify the patient’s name, medical record number, and date of birth from their wristband.",
            imageUrl: "https://placehold.co/400x250/D1FAE5/065F46?text=Patient+ID+Verification%0A(Wristband)"
        }
    ]
  }
];
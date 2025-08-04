<?php
if ($_SERVER['HTTP_HOST'] !== 'gideontigelaar.com') {
    http_response_code(404);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="I'm Gideon, a Dutch software development student who builds a variety of apps & games.">

        <title>Gideon Tigelaar</title>

        <link rel="canonical" href="https://gideontigelaar.com/">

        <link href="src/css/output.css" rel="stylesheet">
        <link rel="preload" href="src/fonts/Manrope-ExtraLight.ttf" as="font" type="font/ttf" crossorigin="anonymous">
        <link rel="preload" href="src/fonts/Manrope-Light.ttf" as="font" type="font/ttf" crossorigin="anonymous">
        <link rel="preload" href="src/fonts/Manrope-Regular.ttf" as="font" type="font/ttf" crossorigin="anonymous">
        <link rel="preload" href="src/fonts/Manrope-Medium.ttf" as="font" type="font/ttf" crossorigin="anonymous">
        <link rel="preload" href="src/fonts/Manrope-SemiBold.ttf" as="font" type="font/ttf" crossorigin="anonymous">
        <link rel="preload" href="src/fonts/Manrope-Bold.ttf" as="font" type="font/ttf" crossorigin="anonymous">
        <link rel="preload" href="src/fonts/Manrope-ExtraBold.ttf" as="font" type="font/ttf" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">

        <script src="src/js/main.js" defer></script>
        <script src="src/js/theme.js"></script>
    </head>

    <body class="bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-medium" id="home">
        <div class="container mx-auto max-w-[700px] px-6 sm:px-3">
            <nav class="sticky top-0 flex justify-between z-50 bg-zinc-50 dark:bg-zinc-950 py-4">
                <a href="#home" aria-label="Home" role="button"><i class="ph ph-house text-[1.5rem] opacity-75 flex items-center"></i></a>
                <ul class="flex items-center gap-6">
                    <li>
                        <a href="#about" class="opacity-75" role="button">About</a>
                    </li>
                    <li>
                        <a href="#projects" class="opacity-75" role="button">Projects</a>
                    </li>
                    <li>
                        <a href="#contact" class="opacity-75" role="button">Contact</a>
                    </li>
                </ul>
                <button class="opacity-75" onclick="toggleThemePopup()" aria-label="Toggle theme" role="button">
                    <i class="ph ph-moon text-[1.5rem] flex items-center" id="moonIcon"></i>
                    <i class="ph ph-sun text-[1.5rem] flex items-center hidden" id="sunIcon"></i>
                </button>

                <div class="absolute right-0 top-full w-36 z-10 bg-white dark:bg-black shadow-md rounded-2xl p-2 text-sm hidden transform" id="themePopup">
                    <button class="flex justify-between items-center gap-2 rounded-lg px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 w-full" onclick="setTheme('light')" aria-label="Switch to light theme" role="button">
                        <span>Light</span>
                        <i class="ph ph-check text-[1rem] flex items-center hidden" aria-hidden="true" id="themeCheck1"></i>
                    </button>
                    <button class="flex justify-between items-center gap-2 rounded-lg px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 w-full" onclick="setTheme('dark')" aria-label="Switch to dark theme" role="button">
                        <span>Dark</span>
                        <i class="ph ph-check text-[1rem] flex items-center hidden" aria-hidden="true" id="themeCheck2"></i>
                    </button>
                    <button class="flex justify-between items-center gap-2 rounded-lg px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 w-full" onclick="setTheme('system')" aria-label="Switch to system theme" role="button">
                        <span>System</span>
                        <i class="ph ph-check text-[1rem] flex items-center hidden" aria-hidden="true" id="themeCheck3"></i>
                    </button>
                </div>
            </nav>

            <main>
                <section id="hero">
                    <div class="py-20 flex flex-col gap-3">
                        <img src="https://avatars.githubusercontent.com/gideontigelaar" class="rounded-full" alt="Gideon Tigelaar" width="100" height="100">
                        <h1 class="font-bold text-3xl">Gideon Tigelaar</h1>
                        <p class="opacity-75 max-w-[500px]">I'm a <?= (new DateTime('2004-11-23'))->diff(new DateTime())->y ?>-year-old software engineering student from the Netherlands, currently working as a PHP Developer at Dotsimpel. I'm particularly interested in web development and have been actively building my skills in this area.</p>
                    </div>
                </section>

                <section id="summary">
                    <div class="py-20 grid grid-cols-2 grid-rows-3 gap-4 sm:grid-cols-3 sm:grid-rows-2 sm:gap-6">
                        <div class="relative h-full w-full rounded-2xl border border-2 border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-100 dark:bg-zinc-900 shadow-sm col-span-2 row-span-1 overflow-hidden">
                            <a href="https://github.com/gideontigelaar" target="_blank" class="h-full flex flex-col justify-between px-7 py-8">
                                <div>
                                    <span class="text-2xl">Languages I use</span>
                                </div>
                                <div class="flex justify-between">
                                    <img src="src/images/logos/languages/php-logo.svg" alt="PHP" width="50" height="50">
                                    <img src="src/images/logos/languages/css-logo.svg" alt="CSS" width="50" height="50">
                                    <img src="src/images/logos/languages/mysql-logo.svg" alt="MySQL" width="50" height="50">
                                    <img src="src/images/logos/languages/js-logo.svg" alt="JavaScript" width="50" height="50">
                                    <img src="src/images/logos/languages/cpp-logo.svg" alt="C++" width="50" height="50">
                                    <img src="src/images/logos/languages/cs-logo.svg" class="hidden md:block" alt="C#" width="50" height="50">
                                </div>
                            </a>
                        </div>

                        <div class="relative h-full w-full rounded-2xl border border-2 border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-100 dark:bg-zinc-900 shadow-sm px-7 py-8 col-span-1 row-span-1 overflow-hidden aspect-square flex flex-col justify-between">
                            <span class="text-2xl">Question?</span>
                            <button class="w-fit text-center rounded-full bg-zinc-200 dark:bg-zinc-800 py-2 px-4" onclick="copyEmail()">
                                <span>Email me</span>
                            </button>
                        </div>

                        <div class="relative h-full w-full rounded-2xl border border-2 border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-100 dark:bg-zinc-900 shadow-sm col-span-1 row-span-1 overflow-hidden aspect-square">
                            <a href="https://whisp.gideontigelaar.com/" target="_blank">
                                <img src="src/images/whisp-logo.png" alt="Whisp" width="100%" height="100%">
                            </a>
                        </div>

                        <div class="relative h-full w-full rounded-2xl border border-2 border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-100 dark:bg-zinc-900 shadow-sm px-7 py-8 col-span-2 row-span-1 overflow-hidden flex justify-between items-center gap-1">
                            <div class="flex flex-col justify-between h-full">
                                <div class="flex items-center w-60 gap-3">
                                    <img src="src/images/logos/instagram-logo.svg" alt="Instagram" width="35" height="35">
                                    <span class="text-base opacity-75">@gideontigelaar</span>
                                </div>

                                <a href="https://www.instagram.com/gideontigelaar/" target="_blank" class="w-fit text-center rounded-full bg-zinc-200 dark:bg-zinc-800 py-2 px-4">
                                    <span>Follow me!</span>
                                </a>
                            </div>

                            <div class="hidden md:grid grid-cols-2 gap-3">
                                <a href="https://www.instagram.com/gideontigelaar/" target="_blank" class="rounded-xl overflow-hidden aspect-square">
                                    <img src="src/images/photos/photo-1.png" class="object-cover" alt="Photo 1">
                                </a>
                                <a href="https://www.instagram.com/gideontigelaar/" target="_blank" class="rounded-xl overflow-hidden aspect-square">
                                    <img src="src/images/photos/photo-2.png" class="object-cover" alt="Photo 2">
                                </a>
                                <a href="https://www.instagram.com/gideontigelaar/" target="_blank" class="rounded-xl overflow-hidden aspect-square">
                                    <img src="src/images/photos/photo-3.png" class="object-cover" alt="Photo 3">
                                </a>
                                <a href="https://www.instagram.com/gideontigelaar/" target="_blank" class="rounded-xl overflow-hidden aspect-square">
                                    <img src="src/images/photos/photo-4.png" class="object-cover" alt="Photo 4">
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about">
                    <div class="py-20 sm:gap-x-6">
                        <h2 class="font-semibold text-2xl mb-2 col-span-2">About</h2>

                        <div class="grid grid-cols-2 gap-12 sm:gap-6">
                            <div class="col-span-2 sm:col-span-1">
                                <p class="opacity-75">I'm a software engineering student from the Netherlands, currently working as a PHP Developer at Dotsimpel. I'm particularly interested in web development and have been actively building my skills in this area.<br><br>My interest in software development began in 2015 when I dived into creating simple games in Unity3D. A few years later, I built my own Discord bot. That's when I realized that programming is my thing!<br><br>For the last year, I've been learning and enjoying all aspects of web development. I even finished a few projects already, like a print job management system and a social media application. Check out my projects below for more information!</p>
                            </div>

                            <div class="col-span-2 sm:col-span-1 flex flex-col gap-6">
                                <h3 class="font-semibold text-xl">Work Experience</h3>

                                <a href="https://www.dotsimpel.nl/" target="_blank" class="flex gap-3">
                                    <img src="src/images/logos/dotsimpel-logo.svg" class="bg-zinc-100 border border-2 border-zinc-300 dark:border-zinc-400 rounded-full" alt="Dotsimpel Logo" width="50" height="50">
                                    <div class="flex flex-col w-full">
                                        <span class="opacity-100">PHP Web Developer</span>
                                        <div class="flex justify-between">
                                            <span class="opacity-75">Dotsimpel</span>
                                            <span class="opacity-75">2025 - Now</span>
                                        </div>
                                    </div>
                                </a>

                                <a href="https://www.aldi.nl/" target="_blank" class="flex gap-3">
                                    <img src="src/images/logos/aldi-nord-logo.svg" class="bg-zinc-100 border border-2 border-zinc-300 dark:border-zinc-400 rounded-full" alt="ALDI Nord Logo" width="50" height="50">
                                    <div class="flex flex-col w-full">
                                        <span class="opacity-100">Assistant Store Manager</span>
                                        <div class="flex justify-between">
                                            <span class="opacity-75">ALDI Nederland</span>
                                            <span class="opacity-75">2024 - Now</span>
                                        </div>
                                    </div>
                                </a>

                                <h3 class="font-semibold text-xl">Education</h3>

                                <a href="https://www.hanze.nl/" target="_blank" class="flex gap-3">
                                    <img src="src/images/logos/hanze-logo.svg" class="bg-zinc-100 border border-2 border-zinc-300 dark:border-zinc-400 rounded-full" alt="Hanze Logo" width="50" height="50">
                                    <div class="flex flex-col w-full">
                                        <span class="opacity-100">Bachelor, Software Engineering</span>
                                        <div class="flex justify-between">
                                            <span class="opacity-75">Hanze</span>
                                            <span class="opacity-75">2025 - Now</span>
                                        </div>
                                    </div>
                                </a>

                                <a href="https://www.alfa-college.nl/" target="_blank" class="flex gap-3">
                                    <img src="src/images/logos/alfa-college-logo.svg" class="bg-zinc-100 border border-2 border-zinc-300 dark:border-zinc-400 rounded-full" alt="Alfa-college Logo" width="50" height="50">
                                    <div class="flex flex-col w-full">
                                        <span class="opacity-100">MBO 4, Software Development</span>
                                        <div class="flex justify-between">
                                            <span class="opacity-75">Alfa-college</span>
                                            <span class="opacity-75">2021 - 2025</span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="projects">
                    <div class="py-20 flex flex-col gap-2">
                        <div>
                            <h2 class="font-semibold text-2xl mb-2">Projects</h2>
                            <p class="opacity-75 mb-2">Here are some of the projects I've worked on.</p>
                        </div>

                        <div class="grid grid-cols-1 gap-12 sm:gap-6">
                            <!-- <a href="https://github.com/gideontigelaar/mila" target="_blank" class="grid grid-cols-3 gap-4">
                                <div class="col-span-3 sm:col-span-1">
                                    <img src="src/images/projects/mila.png" class="border border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm" alt="Mila Project Image">
                                </div>
                                <div class="flex flex-col col-span-3 sm:col-span-2 justify-center">
                                    <span class="text-lg opacity-100">Mila<span class="opacity-75"> • 2025</span></span>
                                    <span class="opacity-75">A real-time portfolio tracker with Trading 212 integration. Built with Next.js and Tailwind CSS for maximum efficiency.</span>
                                </div>
                            </a> -->

                            <a href="https://github.com/gideontigelaar/fiscariep" target="_blank" class="grid grid-cols-3 gap-4">
                                <div class="col-span-3 sm:col-span-1">
                                    <img src="src/images/projects/fiscariep.png" class="border border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm" alt="Fiscariep Project Image">
                                </div>
                                <div class="flex flex-col col-span-3 sm:col-span-2 justify-center">
                                    <span class="text-lg opacity-100">Fiscariep<span class="opacity-75"> • 2024</span></span>
                                    <span class="opacity-75">A print job management system where customers can upload their files and receive a quote. Built for a school project.</span>
                                </div>
                            </a>

                            <a href="https://github.com/gideontigelaar/whisp" target="_blank" class="grid grid-cols-3 gap-4">
                                <div class="col-span-3 sm:col-span-1">
                                    <img src="src/images/projects/whisp.png" class="border border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm" alt="Whisp Project Image">
                                </div>
                                <div class="flex flex-col col-span-3 sm:col-span-2 justify-center">
                                    <span class="text-lg opacity-100">Whisp<span class="opacity-75"> • 2024</span></span>
                                    <span class="opacity-75">A social media platform made for developers to interact with each other. Built with Bootstrap, PHP, and JavaScript to make it as maintainable as possible.</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                <section id="contact">
                    <div class="py-20">
                        <h2 class="font-semibold text-2xl mb-2">Contact</h2>
                        <p class="opacity-75 mb-6">Feel free to reach out to me on any of the following platforms:</p>

                        <div class="flex flex-col gap-4">
                            <div class="flex items-center gap-2">
                                <i class="ph ph-github-logo"></i>
                                <a class="text-blue-600 dark:text-blue-400" href="https://github.com/gideontigelaar" target="_blank">gideontigelaar</a>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="ph ph-linkedin-logo"></i>
                                <a class="text-blue-600 dark:text-blue-400" href="https://www.linkedin.com/in/gideontigelaar" target="_blank">in/gideontigelaar</a>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="ph ph-instagram-logo"></i>
                                <a class="text-blue-600 dark:text-blue-400" href="https://www.instagram.com/gideontigelaar" target="_blank">@gideontigelaar</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer class="flex justify-center items-center bg-zinc-50 dark:bg-zinc-950 py-4 text-sm opacity-75">
                <span>&copy; <span class="cursor-pointer select-none touch-manipulation" id="copyrightYear" role="button" onclick="addYear()"><?= date('Y') ?></span> - Gideon Tigelaar</span>
            </footer>
        </div>
    </body>
</html>
import socket
import unittest

from scripts.serve import find_available_port


class FindAvailablePortTests(unittest.TestCase):
    def test_returns_preferred_port_when_it_is_free(self):
        port = find_available_port(start=38110, attempts=3)

        self.assertEqual(port, 38110)

    def test_skips_ports_that_are_already_in_use(self):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(("127.0.0.1", 38120))
        sock.listen(1)
        self.addCleanup(sock.close)

        port = find_available_port(start=38120, attempts=3)

        self.assertEqual(port, 38121)
